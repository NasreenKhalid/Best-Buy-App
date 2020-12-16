import React from 'react'
import CreateItem from '../components/CreateItem'
import PleaseSignin from '../components/PleaseSignin'

function Sell() {
    return (
        <div>
            <PleaseSignin>
            <CreateItem />
            </PleaseSignin>
          
        </div>
    )
}

export default Sell
