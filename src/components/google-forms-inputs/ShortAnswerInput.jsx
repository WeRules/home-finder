import { useShortAnswerInput } from 'react-google-forms-hooks';
import { TextField } from '@material-ui/core';

function ShortAnswerInput({ id, name, type, ...extraProps }) {
    const { register } = useShortAnswerInput(id);

    return (
        <TextField
            name={name}
            type={type}
            {...extraProps}
            {...register()}
        />
    );
}

export default ShortAnswerInput;
