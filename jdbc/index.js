var Properties = Java.type("java.util.Properties")
  , Driver = Java.type("org.h2.Driver")
  , properties = new Properties()
  , driver = new Driver()
  , connection
  , stmt
  , rs
  ;
 
try {
    properties.setProperty("user", "sa");
    properties.setProperty("password", "");
    
    connection = driver.connect("jdbc:h2:~/nasven-jdbc", properties);
    stmt = connection.prepareStatement("SELECT * FROM information_schema.tables WHERE table_name LIKE ?");
    stmt.setString(1, '%COLUMN%');
    rs = stmt.executeQuery();
    
    print("\n");
    print("INFORMATION_SCHEMA Tables matching %COLUMN%");
    print("-------------------------------------------");
    while (rs.next()) {
        print(rs.getString("TABLE_NAME"));
    }
    print("\n");
}
finally {
    if (rs)
        rs.close();
    
    if (stmt)
        stmt.close();
    
    if (connection)
        connection.close();
}
