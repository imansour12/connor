import { useState, useEffect } from "react";
import {
  TextField,
  CssBaseline,
  Button,
  createTheme,
  ThemeProvider,
  Drawer,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import Papa from "papaparse";

function App() {
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);

  useEffect(() => {
    const storedHistory = localStorage.getItem("searchHistory");
    if (storedHistory) {
      setSearchHistory(JSON.parse(storedHistory));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));
  }, [searchHistory]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/updated.csv");
      const csvData = await response.text();

      Papa.parse(csvData, {
        header: true,
        complete: (parsedData) => {
          const filteredData = parsedData.data.filter(
            (row) => row["Product Code"] === searchText
          );

          const currentSearch =
            filteredData.length > 0 ? filteredData[0] : null;

          setSearchResult(currentSearch);

          if (currentSearch) {
            setSearchHistory((prevHistory) => [currentSearch, ...prevHistory]);
          }

          setLoading(false);
        },
        error: (error) => {
          console.error("Error parsing CSV:", error);
          setLoading(false);
        },
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  const handleJSONClick = () => {
    if (searchResult && searchResult["Product Code"]) {
      const productCode = searchResult["Product Code"];
      window.open(`https://www.cityplumbing.co.uk/search/?text=${productCode}`);
    }
  };

  const handleHistoryItemClick = (productCode) => {
    window.open(`https://www.cityplumbing.co.uk/search/?text=${productCode}`);
  };

  const handleShowHistory = () => {
    setShowHistory(!showHistory);
  };

  const darkTheme = createTheme({
    palette: {
      mode: "dark",
      background: {
        default: "#19171a",
      },
    },
  });

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "0 20px",
          flexDirection: "column",
          position: "relative",
        }}
      >
        <Button
          variant="contained"
          onClick={handleShowHistory}
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            backgroundColor: "#3f51b5",
            color: "#fff",
          }}
        >
          History
        </Button>
        <Drawer
          anchor="right"
          open={showHistory}
          onClose={handleShowHistory}
          style={{ width: 300 }}
        >
          <List>
            {searchHistory.map((item, index) => (
              <ListItem
                button
                key={index}
                onClick={() => handleHistoryItemClick(item["Product Code"])}
              >
                <ListItemText primary={item["Product Code"]} />
              </ListItem>
            ))}
          </List>
        </Drawer>

        <form
          onSubmit={handleSubmit}
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 300,
            width: "100%",
          }}
        >
          <TextField
            label="Search"
            variant="outlined"
            placeholder="Search with product code..."
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSearchResult(null);
            }}
            style={{ marginBottom: 20 }}
          />
          <Button
            variant="contained"
            type="submit"
            style={{
              backgroundColor: "#3f51b5",
              color: "#fff",
              marginBottom: 10,
            }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </Button>
          {searchResult && (
            <Button
              variant="contained"
              style={{ backgroundColor: "#3f51b5", color: "#fff" }}
              onClick={handleJSONClick}
            >
              View Product
            </Button>
          )}
        </form>
        {searchResult && (
          <div
            style={{
              maxWidth: 300,
              width: "100%",
              marginTop: 20,
              padding: 20,
              border: "1px solid #3f51b5",
              borderRadius: 5,
              fontFamily: "monospace",
              fontSize: 12,
              whiteSpace: "pre-wrap",
            }}
          >
            {JSON.stringify(searchResult, null, 2)}
          </div>
        )}
      </div>
    </ThemeProvider>
  );
}

export default App;
