import { useCheckboxInput } from 'react-google-forms-hooks';

function CheckboxInput({ id, ...otherProps }) {
    const { options } = useCheckboxInput(id);

    return (
        <div>
            {options.map((o) => (
                <div key={o.id}>
                    <input type='checkbox' id={o.id} {...otherProps} {...o.registerOption()} />
                    <label htmlFor={o.id}>{o.label}</label>
                </div>
            ))}
        </div>
    );
}

export default CheckboxInput;
