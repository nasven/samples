var Properties = Java.type("java.util.Properties")
  , Driver = Java.type("org.h2.Driver")
  , DSL = Java.type("org.jooq.impl.DSL")
  , properties = new Properties()
  , driver = new Driver()
  , connection
  ;
 
try {
    properties.setProperty("user", "sa");
    properties.setProperty("password", "");
    
    connection = driver.connect("jdbc:h2:~/nasven-jdbc", properties);
    
    DSL.using(connection)
       .fetch("SELECT t.table_schema, t.table_name, count(*) AS cnt "
            + "FROM information_schema.tables t "
            + "JOIN information_schema.columns c "
            + "  ON t.table_schema = c.table_schema "
            + "  AND t.table_name = c.table_name "
            + "GROUP BY t.table_schema, t.table_name "
            + "ORDER BY t.table_schema, t.table_name")
       .intoMaps()
       .forEach(function(r) {
            print(r.TABLE_SCHEMA + "." + r.TABLE_NAME + " has " + r.CNT + " columns.");
       });
}
finally {
    if (connection)
        connection.close();
}
