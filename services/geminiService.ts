import { GoogleGenAI, Type } from "@google/genai";
import type { Mine, MineData, RiskAnalysis, SensorDataPoint, SensorType, RockfallEventType, ForecastData } from '../types';

// Per guidelines, API key must be from process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * FIX: Extracts a JSON object from a string that might contain markdown or other text.
 * The Gemini API can sometimes wrap its JSON response in markdown backticks or add
 * conversational text, which causes standard JSON.parse() to fail. This function
 * makes parsing more robust by isolating the JSON object from the surrounding text.
 * @param text The string response from the API.
 * @returns The parsed JSON object.
 */
const extractJsonObject = <T>(text: string): T => {
    const startIndex = text.indexOf('{');
    const endIndex = text.lastIndexOf('}');
    
    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        console.error("Invalid JSON object structure in response:", text);
        throw new Error("Could not find a valid JSON object in the Gemini API response.");
    }

    const jsonStr = text.substring(startIndex, endIndex + 1);
    
    try {
        return JSON.parse(jsonStr) as T;
    } catch (error) {
        console.error("Error parsing cleaned JSON:", error);
        console.error("Original string for context:", text);
        console.error("Attempted to parse this substring:", jsonStr);
        throw new Error("Failed to parse JSON from Gemini API response after cleaning.");
    }
};


const validRockfallEventTypes: RockfallEventType[] = [
  'Precipitation',
  'Crack propagation',
  'Blasting',
  'Ground vibration',
  'Thermal stress',
  'Unknown'
];

export const getMineData = async (mine: Mine): Promise<MineData> => {
    // Define the schema programmatically for the API to enforce valid JSON output
    const schema = {
        type: Type.OBJECT,
        properties: {
            overallRisk: { type: Type.STRING, description: "The overall risk level for the mine. One of 'Low' or 'Medium'." },
            sensors: {
                type: Type.ARRAY,
                description: "An array of sensor data points.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        time: { type: Type.STRING, description: "ISO 8601 timestamp for the reading." },
                        value: { type: Type.NUMBER, description: "The numerical value of the sensor reading." },
                        sensorId: { type: Type.STRING, description: "A unique identifier for the sensor." },
                        sensorType: { type: Type.STRING, description: "Type of sensor: 'seismic', 'gas', 'temperature', 'air-flow', 'wind-speed', 'displacement', or 'pore-pressure'." },
                    },
                    required: ["time", "value", "sensorId", "sensorType"]
                }
            },
            alerts: {
                type: Type.ARRAY,
                description: "An array of rockfall alerts.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique identifier for the alert." },
                        timestamp: { type: Type.STRING, description: "ISO 8601 timestamp for when the alert was triggered." },
                        zoneName: { type: Type.STRING, description: "The specific zone in the mine where the alert is active." },
                        riskLevel: { type: Type.STRING, description: "The risk level of the alert: 'Low' or 'Medium'." },
                        message: { type: Type.STRING, description: "A human-readable message describing the alert." },
                        suggestedAction: { type: Type.STRING, description: "A recommended action for personnel to take." },
                    },
                    required: ["id", "timestamp", "zoneName", "riskLevel", "message", "suggestedAction"]
                }
            },
            rockfallEvents: {
                type: Type.ARRAY,
                description: "An array of potential rockfall events.",
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING, description: "A unique identifier for the event." },
                        lat: { type: Type.NUMBER, description: "Latitude of the potential event." },
                        lng: { type: Type.NUMBER, description: "Longitude of the potential event." },
                        type: { 
                            type: Type.STRING, 
                            description: "The trigger type for the potential rockfall.",
                            enum: validRockfallEventTypes
                        },
                        volume: { type: Type.NUMBER, description: "Estimated volume of the rockfall in cubic meters." },
                        probability: { type: Type.NUMBER, description: "The probability of the event occurring (0 to 1)." },
                    },
                    required: ["id", "lat", "lng", "type", "volume", "probability"]
                }
            }
        },
        required: ["overallRisk", "sensors", "alerts", "rockfallEvents"]
    };

    const prompt = `
      Generate a realistic, simulated dataset for the "${mine.name}" mining operation, located in ${mine.location} (approx. coordinates: lat ${mine.lat}, lng ${mine.lng}).
      The data should represent a snapshot of current conditions.

      - The 'overallRisk' must be a logical assessment of the generated data. Only 'Low' or 'Medium' risk levels are allowed.
      - Generate a time-series of sensor data for the last 6 hours, with one reading per hour for each of the seven sensor types. Values should fluctuate realistically.
        - Seismic (μm/s): Normal < 500. Spikes > 1500 indicate heightened risk.
        - Displacement (mm): Normal < 10. Spikes > 50 indicate heightened risk.
        - Pore Pressure (kPa): Normal < 50. Spikes > 150 indicate heightened risk.
        - Link spikes in these sensors to a 'Medium' risk level.
      - Create 2-4 alerts based on anomalies in the sensor data. The risk level must be either 'Low' or 'Medium'.
      - Create 40-50 potential rockfall events. These events MUST be realistically distributed across the entire operational area of the mine, not just in one small cluster. The coordinates should be varied within a radius of approximately 0.01 degrees from the central mine coordinates (lat ${mine.lat}, lng ${mine.lng}) to cover different sections like pit walls, benches, and haul roads.
      - Event probabilities should be mostly low (< 0.2). A higher probability event (e.g., >0.3) should be linked to a significant sensor anomaly and a 'Medium' risk alert.
      - Ensure all timestamps are recent and in valid ISO 8601 format.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        
        const generatedData = extractJsonObject<Omit<MineData, 'mine'>>(response.text);

        const mineData: MineData = {
            mine: mine,
            ...generatedData
        };

        mineData.sensors.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
        mineData.alerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return mineData;

    } catch (error) {
        console.error("Error fetching or parsing data from Gemini API:", error);
        throw new Error("Failed to generate mine data using Gemini API.");
    }
};

const getLatestSensorValue = (sensors: SensorDataPoint[], type: SensorType): number | undefined => {
    const relevantSensors = sensors.filter(s => s.sensorType === type);
    if (relevantSensors.length === 0) return undefined;
    // The sensors are sorted oldest to newest, so the last one is the latest.
    return relevantSensors[relevantSensors.length - 1].value;
};


export const getRiskAnalysis = async (mineData: MineData, isScenario: boolean = false): Promise<RiskAnalysis> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            overallAssessment: { type: Type.STRING, description: "A single, clear sentence stating the overall risk level and the primary reason." },
            immediateOutlook: { type: Type.STRING, description: "A short, one-sentence prediction of the immediate outlook (e.g., 'Risk of localized rockfalls is increasing')." },
            keyFactors: {
                type: Type.ARRAY,
                description: "A list of 2-3 of the most critical factors influencing the current risk assessment. Each factor should be a concise bullet point.",
                items: { type: Type.STRING }
            },
            recommendations: {
                type: Type.ARRAY,
                description: "A list of 2-3 of specific, actionable recommendations for mine personnel. Each recommendation should be a concise bullet point.",
                items: { type: Type.STRING }
            }
        },
        required: ["overallAssessment", "immediateOutlook", "keyFactors", "recommendations"]
    };

    const latestSeismic = getLatestSensorValue(mineData.sensors, 'seismic');
    const latestGas = getLatestSensorValue(mineData.sensors, 'gas');
    const latestTemp = getLatestSensorValue(mineData.sensors, 'temperature');
    const latestDisplacement = getLatestSensorValue(mineData.sensors, 'displacement');
    const latestPorePressure = getLatestSensorValue(mineData.sensors, 'pore-pressure');


    const scenarioPreamble = `
        Analyze the following hypothetical 'what-if' scenario for "${mineData.mine.name}".
        The goal is to understand the potential risk implications of specific sensor readings.
    `;
    const realTimePreamble = `
        Act as an expert geotechnical engineer and AI risk analyst for the mining industry.
        You have been provided with the following real-time data for "${mineData.mine.name}":
    `;
    
    const prompt = `
        ${isScenario ? scenarioPreamble : realTimePreamble}
        - Overall Risk Level (Baseline): ${mineData.overallRisk}
        - Active Alerts (Baseline): ${mineData.alerts.map(a => a.message).join(', ') || 'None'}
        - ${isScenario ? 'Hypothetical' : 'Key'} Sensor Readings (latest):
          - Seismic: ${latestSeismic?.toFixed(2) ?? 'N/A'} µm/s
          - Gas: ${latestGas?.toFixed(2) ?? 'N/A'} ppm
          - Temperature: ${latestTemp?.toFixed(2) ?? 'N/A'} °C
          - Displacement: ${latestDisplacement?.toFixed(2) ?? 'N/A'} mm
          - Pore Pressure: ${latestPorePressure?.toFixed(2) ?? 'N/A'} kPa
        
        Based on your comprehensive analysis of ALL available data, generate a concise, point-wise risk analysis.
        Your response MUST be ONLY the JSON object defined in the schema, with no additional text, markdown, conversational filler, or explanations.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        return extractJsonObject<RiskAnalysis>(response.text);
    } catch (error) {
        console.error("Error generating risk analysis from Gemini API:", error);
        throw new Error("Failed to generate AI risk analysis.");
    }
};

export const getForecastData = async (mineData: MineData, hours: number): Promise<ForecastData> => {
    const schema = {
        type: Type.OBJECT,
        properties: {
            forecastHours: { type: Type.NUMBER },
            predictedOverallRisk: { type: Type.STRING, enum: ['Low', 'Medium'] },
            predictedAlerts: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        timestamp: { type: Type.STRING },
                        zoneName: { type: Type.STRING },
                        riskLevel: { type: Type.STRING, enum: ['Low', 'Medium'] },
                        message: { type: Type.STRING },
                        suggestedAction: { type: Type.STRING },
                    },
                    required: ["id", "timestamp", "zoneName", "riskLevel", "message", "suggestedAction"]
                }
            },
            predictedRockfallEvents: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        id: { type: Type.STRING },
                        lat: { type: Type.NUMBER },
                        lng: { type: Type.NUMBER },
                        type: { type: Type.STRING, enum: validRockfallEventTypes },
                        volume: { type: Type.NUMBER },
                        probability: { type: Type.NUMBER },
                    },
                    required: ["id", "lat", "lng", "type", "volume", "probability"]
                }
            },
            summary: {
                type: Type.OBJECT,
                properties: {
                    assessment: { type: Type.STRING, description: "A single sentence summarizing the forecast." },
                    keyDrivers: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points on what sensor trends or events are driving the forecast." },
                    // FIX: Corrected typo from S.STRING to Type.STRING
                    potentialOutcomes: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Bullet points on what could happen if the trends continue." },
                },
                required: ["assessment", "keyDrivers", "potentialOutcomes"]
            }
        },
        required: ["forecastHours", "predictedOverallRisk", "predictedAlerts", "predictedRockfallEvents", "summary"]
    };

    // Summarize the current data to provide context to the model
    const latestSensorReadings = `
      - Seismic: ${getLatestSensorValue(mineData.sensors, 'seismic')?.toFixed(2) ?? 'N/A'} µm/s
      - Displacement: ${getLatestSensorValue(mineData.sensors, 'displacement')?.toFixed(2) ?? 'N/A'} mm
      - Pore Pressure: ${getLatestSensorValue(mineData.sensors, 'pore-pressure')?.toFixed(2) ?? 'N/A'} kPa
    `;
    const activeAlertsSummary = mineData.alerts.length > 0
        ? `Current active alerts: ${mineData.alerts.map(a => `${a.riskLevel} in ${a.zoneName}: ${a.message}`).join('; ')}`
        : 'No current active alerts.';
    
    // Explicitly provide the current state of rockfall events for the model to work with.
    const currentRockfallEvents = JSON.stringify(mineData.rockfallEvents);

    const prompt = `
      Act as an AI-powered geotechnical forecasting model for the "${mineData.mine.name}" mine.
      Your task is to predict the rockfall risk conditions ${hours} hours into the future based on the current situation.

      CURRENT SITUATION:
      - Current Overall Risk: ${mineData.overallRisk}
      - Latest Critical Sensor Readings: ${latestSensorReadings}
      - ${activeAlertsSummary}
      - Current potential rockfall events: ${currentRockfallEvents}

      INSTRUCTIONS:
      1.  **Analyze Trends**: Extrapolate the trends from the time-series sensor data provided over the past 12 hours. Pay close attention to increasing seismic activity, displacement, or pore pressure.
      2.  **Update Probabilities**: Based on the extrapolated trends, you MUST create a NEW list of 'predictedRockfallEvents' for the ${hours}-hour forecast. This list MUST be based on the 'Current potential rockfall events' provided above. Increase the 'probability' for events in areas where sensor trends are negative (e.g., rising pressure). You can also introduce 1-2 new potential events if trends are severe. The 'predictedRockfallEvents' array in your response cannot be empty.
      3.  **Generate New Alerts**: If any zones are predicted to enter a higher risk state, generate new "predicted alerts". Timestamps for these alerts should be in the future (e.g., current time + forecast hours). Risk levels must be 'Low' or 'Medium'.
      4.  **Assess Overall Risk**: Based on the updated event probabilities and new alerts, determine the 'predictedOverallRisk' for the entire mine in ${hours} hours. This must be 'Low' or 'Medium'.
      5.  **Summarize Rationale**: Provide a concise summary explaining your forecast. The 'keyDrivers' should mention the specific sensor trends or high-probability events that led to your assessment.

      Simulate the data based on these instructions and return it in the required JSON format. It is crucial that the 'predictedRockfallEvents' array is populated with the updated and new events.
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });
        const forecastData = extractJsonObject<ForecastData>(response.text);
        
        // Ensure alerts are sorted
        forecastData.predictedAlerts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        return forecastData;

    } catch (error) {
        console.error("Error fetching or parsing forecast data from Gemini API:", error);
        throw new Error("Failed to generate forecast data using Gemini API.");
    }
};

export interface ChatbotResponse {
    text: string;
    sources?: Array<{ web: { uri: string; title: string; } }>;
}

export const getChatbotResponse = async (query: string, mineData: MineData): Promise<ChatbotResponse> => {
    const analysis = await getRiskAnalysis(mineData);

    const systemInstruction = `
        You are MineSafe AI, a friendly and expert AI assistant for the "${mineData.mine.name}" mine.
        Your primary purpose is to answer questions about the mine using the provided real-time data. However, you are also a capable general AI and should answer any other questions the user may have using your Google Search tool.

        Follow these rules:
        1.  **Prioritize Mine Data**: For questions about the mine, always try to answer using the internal "DATA CONTEXT" provided below first. This is the most accurate source for real-time sensor readings, alerts, and risk levels at the mine.
        2.  **Use Google Search**: For any questions that cannot be answered by the internal data—including general knowledge, news, weather for the mine's location (${mineData.mine.location}), or any other topic—you MUST use your Google Search tool to find a reliable answer.
        3.  **Handle Mine Forecasts**: For questions about future mine conditions (e.g., "what will the risk be in 12 hours?"), provide a qualitative forecast. Synthesize the current sensor trends from the DATA CONTEXT with any relevant external information you find (like a weather forecast for rain). For example, if seismic activity is rising and you find a forecast for heavy rain, you should predict an increased risk of rockfalls.
        4.  **Acknowledge Data Gaps**: If a question is about specific mine operations not in the data (e.g., "what's the status of haul truck #5?"), state that this specific information is not available in your dataset, but you can search for other information.
        5.  **Handle Pleasantries**: Respond naturally and politely to simple conversational pleasantries.
        6.  **Be Conversational and Concise**: Provide clear, professional answers. Do not invent information. Base your answers on the provided context or search results.
        7.  **Plain Text Only**: Do not use any markdown formatting (e.g., asterisks for lists or bolding, headers). Your entire response should be plain text.
        8.  **No Source Citing**: Do not cite your sources in your text response. Just provide the answer.
    `;

    const prompt = `
      --- DATA CONTEXT ---
      Mine Name: ${mineData.mine.name}
      Location: ${mineData.mine.location}
      Current Overall Risk Level: ${mineData.overallRisk}
      Total Active Alerts: ${mineData.alerts.length}
      Most Recent Alert: "${mineData.alerts[0]?.message || 'None'}"
      
      Latest Critical Sensor Readings:
      - Seismic: ${getLatestSensorValue(mineData.sensors, 'seismic')?.toFixed(2) ?? 'N/A'} µm/s
      - Displacement: ${getLatestSensorValue(mineData.sensors, 'displacement')?.toFixed(2) ?? 'N/A'} mm
      - Pore Pressure: ${getLatestSensorValue(mineData.sensors, 'pore-pressure')?.toFixed(2) ?? 'N/A'} kPa
      
      AI Analysis Summary:
      - Assessment: ${analysis.overallAssessment}
      - Key Factors: ${analysis.keyFactors.join('; ')}
      - Recommendations: ${analysis.recommendations.join('; ')}
      --- END DATA CONTEXT ---

      Based on the data context provided above, your instructions, and any necessary web searches, answer the following user question.

      USER QUESTION: "${query}"
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                systemInstruction: systemInstruction,
                tools: [{googleSearch: {}}],
            },
        });
        
        const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;

        // FIX: The Gemini API's GroundingChunk type has an optional 'uri', but the app expects a required 'uri'.
        // This filters out any sources without a valid URI and maps the result to the expected type.
        const sources = groundingChunks
            ?.filter(chunk => chunk.web?.uri)
            .map(chunk => ({
                web: {
                    uri: chunk.web!.uri!,
                    title: chunk.web!.title || '',
                }
            }));

        return {
            text: response.text,
            sources: sources,
        };
    } catch (error) {
        console.error("Error getting chatbot response from Gemini API:", error);
        throw new Error("I am currently unable to process your request. Please try again later.");
    }
};