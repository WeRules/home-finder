import { useCheckboxGridInput } from 'react-google-forms-hooks';

// TODO
function CheckboxGridInput({ id }) {
    const { columns, renderGrid } = useCheckboxGridInput(id);

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
                            <input type='checkbox' {...c.registerColumn()} />
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}

export default CheckboxGridInput;
