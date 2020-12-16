import PleaseSignin from '../components/PleaseSignin'
import OrderList from '../components/OrderList'

const OrderPage = (props) => {
    return (
        <div>
            <PleaseSignin>
   <OrderList />
            </PleaseSignin>
          
        </div>
    )
}

export default OrderPage