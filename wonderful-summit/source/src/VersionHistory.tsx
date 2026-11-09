import React from 'react';
import {SummitWindow} from './SummitWindow';
import {VERSION_HISTORY} from './versionHistory';
import {formatGameVersion} from './gameVersion';
export function VersionHistory({onExit}:{onExit:()=>void}){
 return <SummitWindow title="Version History" titleId="version-history-title" className="version-history" onExit={onExit}>
  <ol className="version-history-list" aria-label="Releases, newest first">{VERSION_HISTORY.map(release=><li key={release.version}><h2>version {formatGameVersion(release.version)}</h2><ul>{release.changes.map(change=><li key={change}>{change}</li>)}</ul></li>)}</ol>
 </SummitWindow>;
}
