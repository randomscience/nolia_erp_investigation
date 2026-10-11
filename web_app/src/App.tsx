import './App.css'

import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import Select from '@mui/material/Select';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import { useCallback, useEffect, useMemo, useState } from 'react';
import '@xyflow/react/dist/style.css';
import Login from './pages/login';
import { pb, pocketbaseUrl, sessionDurationMs, sessionExpiryStorageKey } from './constants';
import MainPlot from './plots/MainPlot';
import UserGraph from './plots/UserGraph';

import { AppBar } from './widgets/AppBar';
import type { RecordModel } from 'pocketbase';
import { pbItemUrl } from './helpers/PBFunctions';
import { RegisteredUsers } from './plots/RegisteredUsers';
import { CreatedCompanies } from './plots/CreatedCompanies';

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

  return <ThemeProvider theme={theme}>
    <CssBaseline />
    {isLoggedIn
      ? <Dashboard onLogout={handleLogout} colorMode={colorMode} onToggleColorMode={handleToggleColorMode} />
      : <Login onLogin={handleLogin} />}
  </ThemeProvider>;
}

export default App

function Dashboard({ onLogout, colorMode, onToggleColorMode }: {
  onLogout: () => void;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
}) {
  const [selectedRecord, setSelectedRecord] = useState<RecordModel | undefined>(undefined);
  const [selectedList, setSelectedList] = useState<'users' | 'companies'>('users');
  const [managedCompanies, setManagedCompanies] = useState<RecordModel[]>([]);
  const handleManagedCompaniesLoaded = useCallback((companies: RecordModel[]) => {
    setManagedCompanies(companies);
  }, []);

  return <Box sx={{
    width: '100%',
    height: '100%',

  }}>
    <AppBar onLogout={onLogout} colorMode={colorMode} onToggleColorMode={onToggleColorMode} />
    <MainPlot />
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

    {selectedRecord && selectedList === 'users' && <ManagedCompanies userId={selectedRecord.id} onCompaniesLoaded={handleManagedCompaniesLoaded} />}

    {selectedRecord && selectedList === 'users' && <UserGraph colorMode={colorMode} companies={managedCompanies} selectedUser={selectedList === 'users' ? selectedRecord : undefined} />}

  </Box>
}

export const ManagedCompanies = ({ userId, onCompaniesLoaded }: {
  userId: string;
  onCompaniesLoaded: (companies: RecordModel[]) => void;
}) => {
  const [companiesList, setCompaniesList] = useState<RecordModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    let isActive = true;
    setIsLoading(true);
    setLoadError('');
    onCompaniesLoaded([]);
    const loadCompanies = async () => {
      try {
        pb.autoCancellation(false);
        console.log(userId)
        const companies = await pb.collection('service_hosts').getFullList({
          sort: 'created',
        });
        // TODO fold it into db search
        const result = companies.filter((company) =>
          (company.admins as string[] | undefined)?.includes(userId),
        );
        if (isActive) {
          setCompaniesList(result);
          onCompaniesLoaded(result);
        }
      } catch (error) {
        if (isActive) {
          setLoadError(error instanceof Error ? error.message : 'Unable to load service_hosts.');
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    };

    void loadCompanies();
    return () => {
      isActive = false;
    };
  }, [userId, onCompaniesLoaded]);

  function countFillPercentage(company: RecordModel) {

    var sum = 0;
    var noFields = 0;
    for (var i = 0; i < Object.values(company).length; i++) {
      // if we have one of: "", null, undefined, [] in db, than the value is not provided.
      noFields++;
      var val = Object.values(company)[i]
      if (!(val == "" || val == null)) sum++;
    }
    return sum / noFields;
  }

  return <Box sx={{ mx: 6, my: 3 }}>
    {isLoading ? <CircularProgress size={24} aria-label="Loading users" /> : loadError ? <p>{loadError}</p> : (

      <TableContainer component={Paper} sx={{ maxHeight: 360, border: 1, borderColor: 'divider', borderRadius: 1, boxShadow: 'none' }}>
        <Table stickyHeader size="small" aria-label="Loaded users">
          <TableHead>
            <TableRow>
              <TableCell>Id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>FillPercentage</TableCell>
              <TableCell>Created</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {companiesList.map((company: RecordModel) => (
              <TableRow
                key={company.id}
                hover

                sx={{ cursor: 'pointer' }}
              >
                <TableCell><a href={pbItemUrl('service_hosts', company.id)}>{company.id || 'Null'}</a></TableCell>
                <TableCell>{company.name || 'Null'}</TableCell>
                <TableCell>{`${countFillPercentage(company) * 100 | 0}%`}</TableCell>
                <TableCell>{company.created ? new Date(company.created).toLocaleDateString() : 'Unknown'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    )}
  </Box>;
}