import @/types  from 'alchemy ';

interface elementalStateProps {
    balance: ElementalProperties;
}

export let elementalState = ({ balance }: elementalStateProps) => {
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
