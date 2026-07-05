package hotel.management.hotel.management;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {
    @Autowired
    private CustomerService customersService;
    @PostMapping
    public Customer  addCustomer(@RequestBody Customer customer){
        return customersService.addCustomer(customer);
    }
    @GetMapping
    public List<Customer> findAll(){
        return customersService.findAll();
    }
    @DeleteMapping("/{id}")
    public void DeleteById(@PathVariable Long id){
         customersService.DeleteCustomer(id);
    }
    @PutMapping
    public Customer updateCustomer(@RequestBody Customer customer){
        return customersService.updateCustomer(customer);
    }

}
