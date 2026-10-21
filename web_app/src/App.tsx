import './App.css'

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

import Select from '@mui/material/Select';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useCallback, useEffect, useMemo, useState } from 'react';
import '@xyflow/react/dist/style.css';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/login';
import { pb, sessionDurationMs, sessionExpiryStorageKey } from './constants';
import MainPlot from './plots/MainPlot';
import UserGraph from './plots/UserGraph';

import { AppBar } from './widgets/AppBar';
import type { RecordModel } from 'pocketbase';

import { RegisteredUsers } from './plots/RegisteredUsers';
import { CreatedCompanies } from './plots/CreatedCompanies';
import { ManagedCompanies } from './plots/ManagedCompanies';
import { DBSquashTable } from './plots/DBSquased';

type ColorMode = 'light' | 'dark';
const colorModeStorageKey = 'nolia-color-mode';



function App() {


  const [isLoggedIn, setIsLoggedIn] = useState(pb.authStore.isValid);
  const [colorMode, setColorMode] = useState<ColorMode>(() =>
    localStorage.getItem(colorModeStorageKey) === 'dark' ? 'dark' : 'light',
  );
  const theme = useMemo(() => createTheme({
    palette: { mode: colorMode },
    typography: { fontFamily: '"Roboto Mono", monospace' },
  }), [colorMode]);

  useEffect(() => {
    localStorage.setItem(colorModeStorageKey, colorMode);
    document.documentElement.dataset.colorMode = colorMode;
  }, [colorMode]);

  const handleLogout = useCallback(() => {
    pb.authStore.clear();
    sessionStorage.removeItem(sessionExpiryStorageKey);
    setIsLoggedIn(false);
  }, []);

  const handleLogin = useCallback(() => {
    sessionStorage.setItem(sessionExpiryStorageKey, String(Date.now() + sessionDurationMs));
    setIsLoggedIn(true);
  }, []);

  const handleToggleColorMode = useCallback(() => {
    setColorMode((currentMode) => currentMode === 'light' ? 'dark' : 'light');
  }, []);

  return <HashRouter>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {isLoggedIn
        ? <Dashboard onLogout={handleLogout} colorMode={colorMode} onToggleColorMode={handleToggleColorMode} />
        : <Login onLogin={handleLogin} />}
    </ThemeProvider>
  </HashRouter>;
}

export default App

function Dashboard({ onLogout, colorMode, onToggleColorMode }: {
  onLogout: () => void;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
}) {
  return <Box sx={{
    width: '100%',
    height: '100%',

  }}>
    <AppBar onLogout={onLogout} colorMode={colorMode} onToggleColorMode={onToggleColorMode} />
    <Routes>
      <Route path="/" element={<MainPlot />} />
      <Route path="/tables" element={<TablesPage colorMode={colorMode} />} />
      <Route path="/squashDB" element={<SquashDBPage colorMode={colorMode} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Box>;
}

function TablesPage({ colorMode }: { colorMode: ColorMode }) {
  const [selectedRecord, setSelectedRecord] = useState<RecordModel | undefined>(undefined);
  const [selectedList, setSelectedList] = useState<'users' | 'companies'>('users');
  const [managedCompanies, setManagedCompanies] = useState<RecordModel[]>([]);
  const handleManagedCompaniesLoaded = useCallback((companies: RecordModel[]) => {
    setManagedCompanies(companies);
  }, []);

  return <>
    <Box sx={{ mx: 6, mt: 3 }}>
      <FormControl size="small" sx={{ minWidth: 220 }}>
        <InputLabel id="loaded-list-label">List</InputLabel>
        <Select
          labelId="loaded-list-label"
          id="loaded-list-select"
          value={selectedList}
          label="List"
          onChange={(event) => {
            setSelectedRecord(undefined);
            setManagedCompanies([]);
            setSelectedList(event.target.value as 'users' | 'companies');
          }}
        >
          <MenuItem value="users">Registered users</MenuItem>
          <MenuItem value="companies">Created companies</MenuItem>

        </Select>
      </FormControl>
    </Box>

    {selectedList === 'users' ? <RegisteredUsers onSelect={(newRecordModel) => setSelectedRecord(newRecordModel)} selectedUser={selectedRecord} /> : <CreatedCompanies onSelect={(newRecordModel) => setSelectedRecord(newRecordModel)} selectedCompany={selectedRecord} />}

    {selectedRecord && selectedList === 'users' && <ManagedCompanies user={selectedRecord} onCompaniesLoaded={handleManagedCompaniesLoaded} />}

    {selectedRecord && selectedList === 'users' && <UserGraph colorMode={colorMode} companies={managedCompanies} selectedUser={selectedList === 'users' ? selectedRecord : undefined} />}

  </>;
}



function SquashDBPage({ colorMode }: { colorMode: ColorMode }) {
  const [selectedRecord, setSelectedRecord] = useState<RecordModel | undefined>(undefined);
  const [selectedList, setSelectedList] = useState<'users' | 'companies'>('users');
  const [managedCompanies, setManagedCompanies] = useState<RecordModel[]>([]);
  const handleManagedCompaniesLoaded = useCallback((companies: RecordModel[]) => {
    setManagedCompanies(companies);
  }, []);

  return <>
    <DBSquashTable selectedCompany={selectedRecord} onSelect={(newRecordModel) => setSelectedRecord(newRecordModel)} />
  </>;
}
