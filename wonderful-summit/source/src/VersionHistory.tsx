import React from 'react';
import {SummitWindow} from './SummitWindow';
import {VERSION_HISTORY} from './versionHistory';
import {formatGameVersion} from './gameVersion';
export function VersionHistory({onExit}:{onExit:()=>void}){
 return <SummitWindow title="Version History" titleId="version-history-title" className="version-history" onExit={onExit}>
  <ol className="version-history-list" aria-label="Releases, newest first">{VERSION_HISTORY.map(release=><li key={release.version}><h2>Version {formatGameVersion(release.version)}</h2>{release.publishedAt?<time dateTime={release.publishedAt}>{new Intl.DateTimeFormat(undefined,{dateStyle:'medium',timeStyle:'short',timeZoneName:undefined}).format(new Date(release.publishedAt))}</time>:<small>Date unavailable</small>}<ul>{release.changes.map(change=><li key={change}>{change}</li>)}</ul></li>)}</ol>
 </SummitWindow>;
}
