import React from 'react'
import './header.css'


function Header({ currentAccount, connectWallet }) {
  console.log("currentaccount",currentAccount)
  return (
    <div className='header-container'>
      <div className='header-block'>

      <div className='logo-container'>
        <h1 className='logo-title'>Waves</h1>
      </div>

      <div className='walletlogo-container'>
        <span>
          {!currentAccount && (
            <img onClick={connectWallet} className='meta-icon' src='/metamask.png' alt='metaicon' />
          )}
        </span>
      </div>
      </div>
    </div>
  )
}

export default Header
