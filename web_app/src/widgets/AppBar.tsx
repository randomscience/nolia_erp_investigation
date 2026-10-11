
import IconButton from '@mui/material/IconButton';

import { useState } from 'react';
import '@xyflow/react/dist/style.css';
import { backendEnv, pb } from '../constants';
import Logo from '../assets/nolia_logo_poziom_5.svg'
import { FiMenu } from "react-icons/fi";
import { LeftDrawer } from './LeftDrawer';
import { SessionTimer } from './SessionTimer';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';

export const AppBar: React.FC<{
    onLogout: () => void;
    colorMode: 'light' | 'dark';
    onToggleColorMode: () => void;
}> = ({ onLogout, colorMode, onToggleColorMode }) => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    return <>
        <div style={{
            margin: 'auto',
            height: "60px", width: "96%",
            backgroundColor: 'transparent', left: "2%", right: "2%", top: "0px", display: 'flex',
            alignItems: 'center',
            gap: 16,
        }}>

            <IconButton aria-label="Open menu" onClick={() => setDrawerOpen(true)}>
                <FiMenu size={24} />
            </IconButton>

            <img src={Logo} style={{
                maxHeight: "80px",
                width: "auto"
            }} alt="Logo" />

            <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel id="loaded-list-label">User email</InputLabel>
                <Select
                    labelId="loaded-list-label"
                    id="loaded-list-select"
                    value={"val"}
                    label="List">
                    <MenuItem value="val">{pb.authStore.model?.email}</MenuItem>

                </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel id="loaded-list-label">Backend environment</InputLabel>
                <Select
                    labelId="loaded-list-label"
                    id="loaded-list-select"
                    value={"val"}
                    label="List"

                >
                    <MenuItem value="val">{backendEnv}</MenuItem>

                </Select>
            </FormControl>


            <SessionTimer onExpire={onLogout} />
            <LeftDrawer
                drawerOpen={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                onLogout={onLogout}
                colorMode={colorMode}
                onToggleColorMode={onToggleColorMode}
            />

        </div>

    </>
}


