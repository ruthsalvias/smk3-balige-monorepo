
// Ensure image is displayed correctly and author name is used
const authorName = portfolio.studentName || portfolio.ownerUsername; // Use studentName if available, otherwise ownerUsername

// ... (rest of your code for rendering portfolio item)

// Inside the portfolio rendering logic:
<div className="smk-portfolio-item-author">
  {portfolio.namaSiswa || authorName} {/* Display namaSiswa if available, otherwise the resolved authorName */}
</div>
