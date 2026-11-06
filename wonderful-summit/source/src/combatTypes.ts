import type {DeveloperCommand} from './developerCommands';
import type {Battle} from './battle';
import type {Run} from './run';

export type CombatProps={tutorial2?:import('./tutorial2').Tutorial2Controls;onReviewReady?:()=>void;practice?:import('./Practice').PracticeControls;journey:Run;onDeveloperCommand?:(command:DeveloperCommand)=>void;onFinish:(battle:Battle)=>void};


