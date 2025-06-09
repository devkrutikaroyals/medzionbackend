const fetchProducts = async () => {
    try {
      const response = await axios.get("https://medzionbackend.onrender.com/api/product/all-items");
      console.log("API Response:", response.data); // Debugging line
      if (Array.isArray(response.data)) {
        setProducts(response.data);
      } else {
        setProducts([]);
        console.error("Unexpected API response format", response.data);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };
  const fetchDashboardCounts = async () => {
    try {
      const response = await axios.get("https://medzionbackend.onrender.com/api/manufacturer/counts");
      setCounts(response.data);
    } catch (error) {
      console.error("Error fetching manufacturer counts:", error);
    }
  };
  