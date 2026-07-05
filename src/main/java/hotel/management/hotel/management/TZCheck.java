package hotel.management.hotel.management;


    public class TZCheck {
        public static void main(String[] args) {
            System.out.println("Default TZ ID: " + java.util.TimeZone.getDefault().getID());
            System.out.println("user.timezone property: " + System.getProperty("user.timezone"));
        }
    }

