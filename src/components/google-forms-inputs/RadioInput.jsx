import { useRadioInput } from 'react-google-forms-hooks';

// TODO
function RadioInput({ id }) {
    const { options, customOption, error } = useRadioInput(id);

    return (
        <div>
            {options.map((o) => (
                <div key={o.id}>
                    <input type='radio' id={o.id} {...o.registerOption()} />
                    <label htmlFor={o.id}>{o.label}</label>
                </div>
            ))}
            {customOption && (
                <div>
                    <input
                        type='radio'
                        id={customOption.id}
                        {...customOption.registerOption()}
                    />
                    <label htmlFor={customOption.id}>Outra</label>
                    <input
                        type='text'
                        placeholder='Resposta aqui'
                        {...customOption.registerCustomInput()}
                    />
                </div>
            )}
            <span>{error && 'This field is required'}</span>
        </div>
    );
}

export default RadioInput;