import { useRadioGridInput } from 'react-google-forms-hooks';

// TODO
function RadioGridInput({ id }) {
    const { columns, renderGrid } = useRadioGridInput(id);

    return (
        <div>
            <header>
                <div />
                {columns.map((c) => (
                    <div key={c.label}>{c.label}</div>
                ))}
            </header>
            {renderGrid((l) => (
                <div key={l.label}>
                    <div>{l.label}</div>
                    {l.renderColumns((c) => (
                        <div key={c.label}>
                            <input type='radio' {...c.registerColumn()} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default RadioGridInput;
