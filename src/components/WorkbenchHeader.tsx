interface WorkbenchHeaderProps {
  knowledgeReady: boolean
}

export function WorkbenchHeader({ knowledgeReady }: WorkbenchHeaderProps) {
  return (
    <header className="workbench-header" aria-label="Rubrik">
      <div className="header-mark" />
      <div className="header-title-block">
        <h1>EBICOS AUTOMATVERKTYG</h1>
        <p>{knowledgeReady ? 'AUTOMATER7 + KORPLAN8 AKTIV' : 'LADDAR REFERENSER'}</p>
      </div>
    </header>
  )
}
