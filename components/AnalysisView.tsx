import React, { useState, useEffect } from 'react';
import type { MineData, RiskAnalysis, SensorType } from '../types';
import { getRiskAnalysis } from '../services/geminiService';
import { Card } from './Card';
import { LoadingSpinner } from './LoadingSpinner';
import { LightbulbIcon, ShieldIcon } from './Icons';

interface AnalysisViewProps {
    mineData: MineData | null;
}

interface ScenarioValues {
    seismic: number;
    gas: number;
    temperature: number;
}

const SensorSlider: React.FC<{
    label: string;
    unit: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, unit, value, min, max, step, onChange }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-text-secondary-light dark:text-text-secondary">{label}</label>
            <span className="text-sm font-bold text-text-primary-light dark:text-text-primary bg-background-light dark:bg-background px-2 py-1 rounded-md">{value.toFixed(1)} {unit}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={onChange}
            className="w-full h-2 bg-primary-light dark:bg-primary rounded-lg appearance-none cursor-pointer accent-accent"
        />
    </div>
);


export const AnalysisView: React.FC<AnalysisViewProps> = ({ mineData }) => {
    const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [scenarioValues, setScenarioValues] = useState<ScenarioValues>({ seismic: 0, gas: 0, temperature: 0 });
    const [scenarioAnalysis, setScenarioAnalysis] = useState<RiskAnalysis | null>(null);
    const [isScenarioLoading, setIsScenarioLoading] = useState(false);
    const [scenarioError, setScenarioError] = useState<string | null>(null);


    useEffect(() => {
        if (mineData) {
            const fetchAnalysis = async () => {
                setIsLoading(true);
                setError(null);
                setAnalysis(null);
                try {
                    const result = await getRiskAnalysis(mineData);
                    setAnalysis(result);
                } catch (err) {
                    setError('Failed to load AI analysis. Please try refreshing.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchAnalysis();

            const getLatest = (type: SensorType) => {
                const sensors = mineData.sensors.filter(s => s.sensorType === type);
                return sensors.length > 0 ? sensors[sensors.length - 1].value : 0;
            };

            setScenarioValues({
                seismic: getLatest('seismic'),
                gas: getLatest('gas'),
                temperature: getLatest('temperature'),
            });
            setScenarioAnalysis(null);
            setScenarioError(null);
        }
    }, [mineData]);

    const handleRunScenario = async () => {
        if (!mineData) return;

        setIsScenarioLoading(true);
        setScenarioError(null);
        setScenarioAnalysis(null);

        try {
            const now = new Date().toISOString();
            const scenarioMineData: MineData = {
                ...mineData,
                sensors: [
                    { time: now, value: scenarioValues.seismic, sensorId: 'sim-seismic', sensorType: 'seismic' },
                    { time: now, value: scenarioValues.gas, sensorId: 'sim-gas', sensorType: 'gas' },
                    { time: now, value: scenarioValues.temperature, sensorId: 'sim-temp', sensorType: 'temperature' },
                ]
            };
            const result = await getRiskAnalysis(scenarioMineData, true);
            setScenarioAnalysis(result);

        } catch (err) {
            setScenarioError('Failed to run scenario analysis. Please try again.');
            console.error(err);
        } finally {
            setIsScenarioLoading(false);
        }
    };

    if (!mineData) {
        return <div className="flex items-center justify-center h-full"><p className="text-text-secondary-light dark:text-text-secondary">No mine data available to analyze.</p></div>;
    }
    
    if (isLoading) {
        return <div className="flex items-center justify-center h-full"><LoadingSpinner /></div>;
    }
    
    if (error) {
         return <div className="flex items-center justify-center h-full text-critical"><p>{error}</p></div>;
    }

    if (!analysis) {
        return null; // Should be covered by loading/error states
    }

    return (
        <div className="space-y-6">
            <Card title="AI Risk Analysis (Live Data)">
                <div className="space-y-4">
                    <div>
                        <h4 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary uppercase tracking-wider">Assessment</h4>
                        <p className="text-lg text-text-primary-light dark:text-text-primary">{analysis.overallAssessment}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary uppercase tracking-wider">Immediate Outlook</h4>
                        <p className="text-lg text-text-primary-light dark:text-text-primary">{analysis.immediateOutlook}</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card title="Key Contributing Factors">
                    <ul className="space-y-3 text-text-primary-light dark:text-text-primary">
                        {analysis.keyFactors.map((factor, index) => (
                           <li key={index} className="flex items-start p-3 bg-primary-light/40 dark:bg-primary/40 rounded-lg hover:bg-primary-light dark:hover:bg-primary transition-colors duration-200">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-accent/20 flex items-center justify-center mr-4">
                                    <span className="text-secondary-accent"><LightbulbIcon /></span>
                                </div>
                                <span className="pt-1">{factor}</span>
                           </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Actionable Recommendations">
                    <ul className="space-y-3 text-text-primary-light dark:text-text-primary">
                        {analysis.recommendations.map((rec, index) => (
                           <li key={index} className="flex items-start p-3 bg-primary-light/40 dark:bg-primary/40 rounded-lg hover:bg-primary-light dark:hover:bg-primary transition-colors duration-200">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-4">
                                    <span className="text-accent"><ShieldIcon /></span>
                                </div>
                                <span className="pt-1">{rec}</span>
                           </li>
                        ))}
                    </ul>
                </Card>
            </div>
            
            <Card title="What-If Scenario Analysis">
                <div className="space-y-4">
                    <p className="text-sm text-text-secondary-light dark:text-text-secondary">Adjust the sliders to simulate different sensor readings and run a new AI analysis to predict the potential impact on risk.</p>
                    <SensorSlider label="Seismic Activity" unit="μm/s" min={0} max={2000} step={10} value={scenarioValues.seismic} onChange={(e) => setScenarioValues(v => ({...v, seismic: parseFloat(e.target.value)}))} />
                    <SensorSlider label="Gas Levels" unit="ppm" min={0} max={200} step={1} value={scenarioValues.gas} onChange={(e) => setScenarioValues(v => ({...v, gas: parseFloat(e.target.value)}))} />
                    <SensorSlider label="Temperature" unit="°C" min={0} max={80} step={1} value={scenarioValues.temperature} onChange={(e) => setScenarioValues(v => ({...v, temperature: parseFloat(e.target.value)}))} />
                    <button onClick={handleRunScenario} disabled={isScenarioLoading} className="w-full px-4 py-2 mt-4 bg-gradient-to-r from-accent to-secondary-accent text-white font-semibold rounded-lg hover:from-accent-hover hover:to-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        {isScenarioLoading ? 'Analyzing Scenario...' : 'Run Scenario Analysis'}
                    </button>
                </div>
                {isScenarioLoading && <div className="mt-6 flex justify-center"><LoadingSpinner /></div>}
                {scenarioError && <div className="mt-6 text-center text-critical">{scenarioError}</div>}
                {scenarioAnalysis && (
                    <div className="mt-6 pt-6 border-t border-border-light dark:border-border space-y-4">
                        <h4 className="text-lg font-bold text-text-primary-light dark:text-text-primary">Scenario Analysis Result</h4>
                         <div className="space-y-4 bg-primary-light/30 dark:bg-primary/30 p-4 rounded-md">
                            <div>
                                <h5 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary uppercase tracking-wider">Scenario Assessment</h5>
                                <p className="text-md text-text-primary-light dark:text-text-primary">{scenarioAnalysis.overallAssessment}</p>
                            </div>
                            <div>
                                <h5 className="text-sm font-medium text-text-secondary-light dark:text-text-secondary uppercase tracking-wider">Scenario Outlook</h5>
                                <p className="text-md text-text-primary-light dark:text-text-primary">{scenarioAnalysis.immediateOutlook}</p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <div>
                                <h5 className="font-semibold text-text-primary-light dark:text-text-primary mb-2">Key Factors (Scenario)</h5>
                                <ul className="space-y-3 text-text-primary-light dark:text-text-primary">
                                    {scenarioAnalysis.keyFactors.map((factor, index) => (
                                       <li key={index} className="flex items-start p-3 bg-primary-light/40 dark:bg-primary/40 rounded-lg">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary-accent/20 flex items-center justify-center mr-4"><span className="text-secondary-accent"><LightbulbIcon /></span></div>
                                            <span className="pt-1">{factor}</span>
                                       </li>
                                    ))}
                                </ul>
                            </div>
                             <div>
                                <h5 className="font-semibold text-text-primary-light dark:text-text-primary mb-2">Recommendations (Scenario)</h5>
                                <ul className="space-y-3 text-text-primary-light dark:text-text-primary">
                                    {scenarioAnalysis.recommendations.map((rec, index) => (
                                       <li key={index} className="flex items-start p-3 bg-primary-light/40 dark:bg-primary/40 rounded-lg">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center mr-4"><span className="text-accent"><ShieldIcon /></span></div>
                                            <span className="pt-1">{rec}</span>
                                       </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

             <div className="text-center text-xs text-text-secondary-light dark:text-text-secondary pt-4">
                <p>This analysis is AI-generated based on real-time sensor data, simulated geotechnical models (DEM, imagery), and historical patterns. It should be used as a decision-support tool in conjunction with expert human oversight.</p>
            </div>
        </div>
    );
};