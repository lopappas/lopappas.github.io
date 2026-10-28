import React from 'react';
import {createRoot} from 'react-dom/client';
import {RunGame} from './RunScreens';
import {Combat} from './main';
import {DeveloperProvider} from './Developer';
createRoot(document.getElementById('root')!).render(<DeveloperProvider><RunGame Combat={Combat}/></DeveloperProvider>);
