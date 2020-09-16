<?php

require("phpsqlajax_dbinfo.php");

// Start XML file, create parent node

$dom = new DOMDocument("1.0");
$node = $dom->createElement("markers");
$parnode = $dom->appendChild($node);

// Opens a connection to a MySQL server

$connection=mysql_connect ('localhost', $username, $password);
if (!$connection) {  die('Not connected : ' . mysql_error());}

// Set the active MySQL database

$db_selected = mysql_select_db($database, $connection);
if (!$db_selected) {
  die ('Can\'t use db : ' . mysql_error());
}

// Select all the rows in the markers table

$query = "SELECT * FROM markers WHERE 1";
$result = mysql_query($query);
if (!$result) {
  die('Invalid query: ' . mysql_error());
}

header("Content-type: text/xml");

// Iterate through the rows, adding XML nodes for each

while ($row = @mysql_fetch_assoc($result)){
  // Add to XML document node
  $node = $dom->createElement("marker");
  $newnode = $parnode->appendChild($node);
  $newnode->setAttribute("id",$row['id']);
  $newnode->setAttribute("name",$row['name']);
  $newnode->setAttribute("address", $row['address']);
  $newnode->setAttribute("lng", $row['lng']);
  $newnode->setAttribute("lat", $row['lat']);
  $newnode->setAttribute("location", $row['location']);
}

echo $dom->saveXML();

?>

The code above initializes a new XML document and creates the "markers" parent node.
It then connects to the database, executes a SELECT * (select all) query on the markers table,
and iterates through the results. The code then creates a XML node for each row in the table (for each location),
with the row attributes as XML attributes, and appends it to the parent node.
It then dumps the output XML to the browser screen.

Note: If your database contains international characters,
or you need to force a UTF-8 output, you can use utf8_encode on the data output.
