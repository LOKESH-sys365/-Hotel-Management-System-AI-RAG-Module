package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CustomerService {
    @Autowired
    private CustomerRespository customerRespository;

    public Customer  addCustomer(Customer customer){
        return customerRespository.save(customer);
    }

    public Customer findByAdharNo(Customer adharNo) {
        return customerRespository.save(adharNo);
    }
    public List<Customer> findAll() {
        return customerRespository.findAll();
    }
    public  void DeleteCustomer(Long id){
        customerRespository.deleteById(id);
    }
    public Customer updateCustomer(Customer customer){
        return customerRespository.save(customer);
    }

}
