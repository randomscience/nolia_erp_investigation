import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { backendEnv, backendEnvStorageKey, backendEnvs, pb, type BackendEnv } from './constants';

function BackendEnvSelector() {
    const handleChange = (event: SelectChangeEvent<BackendEnv>) => {
        localStorage.setItem(backendEnvStorageKey, event.target.value);
        pb.authStore.clear();
        window.location.reload();
    };

    return (
        <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel id="backend-env-label">Backend</InputLabel>
            <Select
                labelId="backend-env-label"
                value={backendEnv}
                label="Backend"
                onChange={handleChange}
            >
                {Object.keys(backendEnvs).map((env) => (
                    <MenuItem key={env} value={env}>{env}</MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default BackendEnvSelector;