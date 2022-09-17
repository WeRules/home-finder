import { useLongAnswerInput } from 'react-google-forms-hooks';
import { TextField } from '@material-ui/core';

function LongAnswerInput({ id, name, ...extraProps }) {
    const { register } = useLongAnswerInput(id);

    return (
        <TextField
            multiline
            name={name}
            minRows={3}
            {...extraProps}
            {...register()}
        />
    );
}

export default LongAnswerInput;
