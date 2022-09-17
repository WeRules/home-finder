import { useLinearInput } from 'react-google-forms-hooks';

// TODO
function LinearGrid({ id }) {
    const { options, legend, error } = useLinearInput(id);

    return (
        <>
            <div>
                <div>{legend.labelFirst}</div>
                {options.map((o) => {
                    return <input key={o.id} type='radio' {...o.registerOption()} />;
                })}
                <div>{legend.labelLast}</div>
            </div>
            <span>{error && 'This field is required'}</span>
        </>
    );
}

export default LinearGrid;
