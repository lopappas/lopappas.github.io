import type {DeveloperCommand} from './developerCommands';
import type {Battle} from './battle';
import type {Run} from './run';
import type {TutorialCheckpoint,TutorialEvent,TutorialLesson} from './tutorial';
import type {SpellId} from './magic';

export type CombatProps={practice?:import('./Practice').PracticeControls;journey:Run;onDeveloperCommand?:(command:DeveloperCommand)=>void;onFinish:(battle:Battle)=>void;tutorial?:{checkpoint:TutorialCheckpoint;lesson:TutorialLesson;studiedSpell:SpellId|null;settling:boolean;feedback:string|null;paused:boolean;onPause:()=>void;onExit:()=>void;onEvent:(event:TutorialEvent,snapshot:TutorialCheckpoint)=>void}};

