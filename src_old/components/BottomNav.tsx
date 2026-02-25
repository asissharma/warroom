import { IconDash, IconVault, IconChart, IconGear } from './Icons';

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
    const navItems = [
        { id: 'dash', label: 'Mission', icon: <IconDash className="w-[22px] h-[22px] mb-[0.2rem]" /> },
        { id: 'vault', label: 'Syllabus', icon: <IconVault className="w-[22px] h-[22px] mb-[0.2rem]" /> },
        { id: 'stats', label: 'Analytics', icon: <IconChart className="w-[22px] h-[22px] mb-[0.2rem]" /> },
        { id: 'config', label: 'Config', icon: <IconGear className="w-[22px] h-[22px] mb-[0.2rem]" /> },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-[70px] bg-[var(--surface-glass)] backdrop-blur-[20px] border-t border-[var(--glass-border)] flex justify-around items-center pb-[env(safe-area-inset-bottom)] z-[100] shadow-[0_-8px_32px_0_rgba(31,38,135,0.07)]">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex flex-col items-center justify-center w-full h-full text-[0.7rem] font-semibold transition-colors ${activeTab === item.id ? 'text-[var(--accent-purple)]' : 'text-[var(--text-muted)]'
                        }`}
                >
                    {item.icon}
                    <span>{item.label}</span>
                </button>
            ))}
        </nav>
    );
}
