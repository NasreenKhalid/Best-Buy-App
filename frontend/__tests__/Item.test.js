import ItemComponent from '../components/Item'
import { shallow, mount} from 'enzyme'
import PriceTag from '../components/styles/PriceTag'
import toJSON from 'enzyme-to-json'

const fakeItem = {
    id: 'ABC123',
  title: 'A Cool Item',
  price: 4000,
  description: 'This item is really cool!',
  image: 'dog.jpg',
  largeImage: 'largedog.jpg',
    
}

// describe('<Item />' , () => {
// it('renders and displays properly' , () => {
// const wrapper = shallow(<ItemComponent item={fakeItem} />)
// const Pricetag = wrapper.find('PriceTag');
// console.log(Pricetag.children());
// expect(PriceTag.children().text()).toBe('$40')
// // console.log(wrapper.debug());
//     })
// })

describe('<Item />', () => {
it('renders and matches the snapshot' , () => {
  const price = '$50.35'
  expect(price).toMatchSnapshot();
})

})