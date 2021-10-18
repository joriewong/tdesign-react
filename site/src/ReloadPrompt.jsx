import React from 'react'
import './ReloadPrompt.css'
import { Button } from '@tencent/tdesign-react';

import { useRegisterSW } from 'virtual:pwa-register/react'

function ReloadPrompt() {
  // replaced dynamically
  const buildDate = '__DATE__'
  // replaced dyanmicaly
  const reloadSW = '__RELOAD_SW__'

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      // eslint-disable-next-line prefer-template
      console.log('SW Registered: ' + r)
    },
    onRegisterError(error) {
      console.log('SW registration error', error)
    },
  })

  const close = () => {
    setOfflineReady(false)
    setNeedRefresh(false)
  }

  return (
    <div className="ReloadPrompt-container">
      { (offlineReady || needRefresh)
          && <div className="ReloadPrompt-toast">
            <div className="ReloadPrompt-toast-message">
              { offlineReady
                ? <span>App ready to work offline</span>
                : <span>New content available, click on reload button to update.</span>
              }
            </div>
            { needRefresh && <Button size="small" onClick={() => updateServiceWorker(true)}>Reload</Button> }
            <Button style={{ marginLeft: 12 }} theme="default" size="small" onClick={() => close()}>Close</Button>
          </div>
      }
      <div className="ReloadPrompt-date">{buildDate}</div>
    </div>
  )
}

export default ReloadPrompt;
