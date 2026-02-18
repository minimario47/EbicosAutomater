interface WorkbenchHeaderProps {
  knowledgeReady: boolean
}

export function WorkbenchHeader({ knowledgeReady }: WorkbenchHeaderProps) {
  return (
    <header className="workbench-header" aria-label="Header">
      <div className="header-mark" />
      <div className="header-title-block">
        <h1>EBICOS AUTOMATER</h1>
        <p>{knowledgeReady ? 'VL_TR_2020-0028 PRIMARY' : 'LOADING REFERENCE'}</p>
      </div>
    </header>
  )
}
