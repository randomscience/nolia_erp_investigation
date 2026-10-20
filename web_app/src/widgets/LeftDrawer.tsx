
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';

import '@xyflow/react/dist/style.css';

import { FiMoon, FiSun, FiX, FiLogOut } from "react-icons/fi";
import { MainButton } from './MainButton';

export const LeftDrawer: React.FC<{
    drawerOpen: boolean;
    onClose: () => void;
    onLogout: () => void;
    colorMode: 'light' | 'dark';
    onToggleColorMode: () => void;
}> = (props) => {

    return <Drawer anchor="left" open={props.drawerOpen} onClose={props.onClose}>
        <Box sx={{ width: 320, maxWidth: '85vw', minHeight: '100vh', boxSizing: 'border-box', p: 3, display: 'flex', flexDirection: 'column' }} role="presentation">
            <IconButton aria-label="Close menu" onClick={props.onClose} sx={{ display: 'block', ml: 'auto' }}>
                <FiX size={24} />
            </IconButton>
            <h2>Menu</h2>
            <MainButton
                leftIcon={props.colorMode === 'light' ? <FiMoon /> : <FiSun />}
                onClick={props.onToggleColorMode}
                label={`Switch to ${props.colorMode === 'light' ? 'dark' : 'light'} mode`} />

            <div style={{ "height": "12px" }} />

            <MainButton
                leftIcon={<FiLogOut style={{ transform: "rotate(180deg)" }} />}
                onClick={props.onLogout}
                label={"Wyloguj"} />


            <Box sx={{ mt: 'auto', pt: 2, borderTop: 1, borderColor: 'divider', color: 'text.secondary', fontSize: 12 }}>
                v0.0.1
            </Box>
        </Box>
    </Drawer>
}