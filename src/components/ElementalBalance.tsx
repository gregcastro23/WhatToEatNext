import type { ElementalProperties } from '@/types/alchemy';

interface ElementalStateProps {
    balance: ElementalProperties;
}

export const elementalState = ({ balance }: ElementalStateProps) => {
    return (
        <div className="elemental-balance">
            {Object.entries(balance).map(([element, value]) => (
                <div 
                    key={element}
                    data-testid={`${element.toLowerCase()}-balance`}
                    className="element-display"
                >
                    {element}: {Math.round(value * 100)}%
                </div>
            ))}
        </div>
    );
};
