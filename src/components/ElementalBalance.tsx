import { _ElementalProperties } from '@/types/alchemy';

interface elementalStateProps {
    balance: ElementalProperties;
}

export const elementalState = ({ balance }: elementalStateProps) => {
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
