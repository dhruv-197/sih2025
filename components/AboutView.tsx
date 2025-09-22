import React, { useState } from 'react';

import {
    EmailIcon, LinkedInIcon,
    ZeroHarmIcon, DataDrivenIcon, GlobalStandardIcon
} from './Icons';

const teamMembers = [
    {
        name: 'Dhruv Soni',
        role: 'Project Contributor',
        email: 'dhruv.s.1978@gmail.com',
        linkedin: 'https://www.linkedin.com/in/dhruv-soni-76a60b312/',
        details: {
            skills: ['Learning C', 'C++', 'Python', 'Javascript', 'Photo and Video Editing'],
            project: `1. Created Satellite Image Forest Recognition
2. AI chatbot for museum ticket booking and services
3. Developed an Ethical AI and its dedicated website.
4. Duplicates of Amazon, YouTube, etc.`,
            achievement: 'Shortlisted in Maverick Effect 2025',
        }
    },
    {
        name: 'Jay Shah',
        role: 'Project Contributor',
        email: 'jayshah02611@gmail.com',
        linkedin: 'https://www.linkedin.com/in/jay-shah-7b2310332/',
        details: {
            skills: ['Ethical AI Development', 'Website Design', 'UI/UX', 'Team Collaboration'],
            project: 'Developed an Ethical AI and its dedicated website.',
            achievement: 'Shortlisted in Maverick Effect 2025',
        }
    },
    {
        name: 'Maulie Jain',
        role: 'Project Contributor',
        email: 'jainmaulie@gmail.com',
        linkedin: 'https://www.linkedin.com/in/maulie-jain-345517332/',
        details: {
            skills: ['C', 'Python', 'Good in Study'],
            project: 'Many Small Projects at Collage',
            achievement: '',
        }
    },
    {
        name: 'Mohit Makwana',
        role: 'Project Contributor',
        email: 'mohitmakwana2610@gmail.com',
        linkedin: 'https://www.linkedin.com/in/mohit-makwana-a95570289/',
        details: {
            skills: ['Responsible AI Design', 'Web Development', 'User Interface & Experience Design', 'Collaborative Teamwork'],
            project: 'Developed an Ethical AI and its dedicated website.',
            achievement: 'Shortlisted in Maverick Effect 2025',
        }
    },
    {
        name: 'Heet Patel',
        role: 'Project Contributor',
        email: 'heetpatel1200@gmail.com',
        linkedin: 'https://www.linkedin.com/in/heet-patel-%E2%86%97%EF%B8%8F-08a882320/',
        details: {
            skills: ['AI & Automation Development', 'Data Analysis & Problem Solving', 'Entrepreneurship & Business Strategy', 'Project Management', 'Networking & Relationship Building'],
            project: 'Developed an Ethical AI and its dedicated website.',
            achievement: 'Shortlisted in Maverick Effect 2025',
        }
    },
    {
        name: 'Hetva Mehta',
        role: 'Project Contributor',
        email: 'Hetvamehta01@gmail.com',
        linkedin: 'https://www.linkedin.com/in/hetva-mehta-17b4b2322/',
        details: {
            skills: ['Vision Architecture', 'Strategic Planning', 'Innovation Leadership', 'AI & Web Integration'],
            project: 'Developed an Ethical AI and its dedicated website.',
            achievement: 'Shortlisted in Maverick Effect 2025',
        }
    }
];

const visionPoints = [
    {
        Icon: ZeroHarmIcon,
        title: 'Zero Harm',
        description: 'To create a mining environment where predictive technology eliminates accidents, ensuring every worker returns home safely.'
    },
    {
        Icon: DataDrivenIcon,
        title: 'Data-Driven Decisions',
        description: 'To empower mine operators with real-time, intelligent insights, transforming reactive measures into proactive strategies.'
    },
    {
        Icon: GlobalStandardIcon,
        title: 'Global Standard',
        description: 'To establish MineSafe as the new benchmark for safety and efficiency in mining operations worldwide.'
    }
];


type TeamMember = typeof teamMembers[0];

const TeamMemberModal: React.FC<{ member: TeamMember; onClose: () => void }> = ({ member, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in" onClick={onClose}>
            <div className="bg-card-light dark:bg-card w-full max-w-2xl rounded-xl shadow-2xl border border-border-light dark:border-border p-8 m-4 transform transition-all duration-300 scale-95 hover:scale-100" onClick={e => e.stopPropagation()}>
                <h3 className="text-3xl font-bold text-text-primary-light dark:text-text-primary">{member.name}</h3>
                <p className="text-accent text-lg mb-6">{member.role}</p>
                
                <div className="space-y-4 text-text-primary-light dark:text-text-primary">
                    <div>
                        <h4 className="font-bold text-sm uppercase text-text-secondary-light dark:text-text-secondary tracking-wider mb-2">Skills</h4>
                        <div className="flex flex-wrap gap-2">
                            {member.details.skills.map(skill => (
                                <span key={skill} className="bg-primary-light dark:bg-primary px-3 py-1 rounded-full text-sm">{skill}</span>
                            ))}
                        </div>
                    </div>
                     <div>
                        <h4 className="font-bold text-sm uppercase text-text-secondary-light dark:text-text-secondary tracking-wider mb-2">Project</h4>
                        <p className="whitespace-pre-wrap">{member.details.project}</p>
                    </div>
                     {member.details.achievement && (
                        <div>
                            <h4 className="font-bold text-sm uppercase text-text-secondary-light dark:text-text-secondary tracking-wider mb-2">Achievement</h4>
                            <p>{member.details.achievement}</p>
                        </div>
                     )}
                </div>

                <div className="mt-8 pt-6 border-t border-border-light dark:border-border flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-primary-light dark:bg-primary text-text-primary-light dark:text-text-primary font-semibold rounded-lg hover:bg-opacity-80 transition-colors">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const TeamMemberCard: React.FC<{ member: TeamMember, onClick: () => void }> = ({ member, onClick }) => {
    const [style, setStyle] = useState({});

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - left) / width - 0.5;
        const y = (e.clientY - top) / height - 0.5;
        const rotateX = -y * 10;
        const rotateY = x * 10;
        setStyle({
            transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`,
            transition: 'transform 0.1s ease-out',
        });
    };

    const handleMouseLeave = () => {
        setStyle({
            transform: 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)',
            transition: 'transform 0.5s ease-in-out',
        });
    };

    return (
        <div 
            className="relative p-6 bg-card-light dark:bg-card rounded-lg shadow-lg border border-border-light dark:border-border cursor-pointer overflow-hidden group"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={style}
            onClick={onClick}
        >
            <div className="relative z-10">
                <h4 className="text-lg font-bold text-text-primary-light dark:text-text-primary">{member.name}</h4>
                <p className="text-sm text-text-secondary-light dark:text-text-secondary">{member.role}</p>
            </div>
             <div className="absolute inset-0 z-20 bg-black/50 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white hover:text-accent transition-colors" onClick={e => e.stopPropagation()}><LinkedInIcon /></a>
                <a href={`mailto:${member.email}`} className="text-white hover:text-accent transition-colors" onClick={e => e.stopPropagation()}><EmailIcon /></a>
            </div>
        </div>
    );
};

export const AboutView: React.FC = () => {
    const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {selectedMember && <TeamMemberModal member={selectedMember} onClose={() => setSelectedMember(null)} />}

            {/* Header Section */}
            <div className="text-center">
                 <h2 className="text-base font-semibold text-accent tracking-wider uppercase">Our Project Team</h2>
                <p className="mt-2 text-3xl font-extrabold text-text-primary-light dark:text-text-primary tracking-tight sm:text-4xl">
                    Meet the Innovators Behind MineSafe
                </p>
                <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary-light dark:text-text-secondary">
                    Forged in the halls of Saffrony Institute of Technology, MineSafe is the culmination of passion, innovation, and a drive to revolutionize mine safety. Our team combined cutting-edge AI with geotechnical expertise to create a tool that protects lives and resources.
                </p>
            </div>

            {/* Team Members Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teamMembers.map(member => (
                    <TeamMemberCard key={member.name} member={member} onClick={() => setSelectedMember(member)} />
                ))}
            </div>
            
            {/* College Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center bg-card-light dark:bg-card p-8 rounded-lg shadow-lg border border-border-light dark:border-border">
                <div>
                    <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary">Our College</h3>
                    <p className="text-xl font-semibold text-accent mt-1">SAFFRONY INSTITUTE OF TECHNOLOGY</p>
                    <p className="text-text-secondary-light dark:text-text-secondary mt-2">Near Shanku’s Water Park, Ahmedabad – Mehsana Highway, Linch, Gujarat 384435</p>
                    <p className="mt-4 text-text-primary-light dark:text-text-primary">We are proud to have developed this project as part of our curriculum, applying academic knowledge to solve real-world industrial challenges.</p>
                </div>
                <div className="h-64 rounded-lg overflow-hidden">
                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3658.818445100656!2d72.39485961497676!3d23.48472128471192!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x395c555555555555%3A0x23943b3531663738!2sSaffrony%20Institute%20of%20Technology!5e0!3m2!1sen!2sin"
                        width="100%"
                        height="100%"
                        style={{ border: 0 }}
                        allowFullScreen={false}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Saffrony Institute of Technology Location"
                        className="grayscale invert-[0.9] hue-rotate-[180deg] contrast-90"
                    ></iframe>
                </div>
            </div>

            {/* Mission & Vision Section */}
            <div>
                <h3 className="text-2xl font-bold text-text-primary-light dark:text-text-primary mb-6 text-center">Our Mission & Vision</h3>
                <div className="bg-card-light dark:bg-card p-8 rounded-lg shadow-lg border border-border-light dark:border-border grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
                    {/* Mission Column */}
                    <div className="lg:col-span-2 border-r-0 lg:border-r lg:border-border-light dark:lg:border-border lg:pr-8">
                        <h4 className="text-2xl font-bold text-accent mb-4">Our Mission</h4>
                        <p className="text-text-primary-light dark:text-text-primary leading-relaxed">
                            To harness the power of predictive AI to create the safest possible environments for mining operations. We are dedicated to developing and deploying intelligent, real-time monitoring systems that prevent accidents, protect workers, and preserve valuable resources.
                        </p>
                    </div>
                    {/* Vision Column */}
                    <div className="lg:col-span-3">
                         <h4 className="text-2xl font-bold text-accent mb-4">Our Vision</h4>
                         <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {visionPoints.map((point) => (
                                 <div key={point.title} className="flex flex-col items-center text-center p-2 group">
                                     <div className="p-4 bg-primary-light dark:bg-primary rounded-full text-accent transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg mb-3">
                                         <point.Icon />
                                     </div>
                                     <h4 className="font-bold text-md text-text-primary-light dark:text-text-primary">{point.title}</h4>
                                     <p className="mt-1 text-xs text-text-secondary-light dark:text-text-secondary">{point.description}</p>
                                 </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};