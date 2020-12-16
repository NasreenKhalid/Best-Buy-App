describe('mocking', () => {
    it.skip('mocks a reg function' , () => {
       const fetchDogs = jest.fn();
       fetchDogs();
       expect(fetchDogs).toHaveBeenCalled();
       console.log(fetchDogs) 
    })
})