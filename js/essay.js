document.addEventListener('DOMContentLoaded', function() {
    const content = document.querySelector('.content');
    const citationsColumn = document.querySelector('.citations');
    const toc = document.getElementById('TOC');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const tocLinks = [];

    // Generate table of contents and prepare headings
    headings.forEach((heading, index) => {
        const link = document.createElement('a');
        link.textContent = heading.textContent;
        link.href = `#heading-${index}`;
        heading.id = `heading-${index}`;
        
        const li = document.createElement('li');
        li.appendChild(link);
        toc.appendChild(li);
        tocLinks.push(link);
    });

    // Handle inline citations
    const citations = document.querySelectorAll('.citation');
    citations.forEach((citation, index) => {
        const citationText = citation.getAttribute('data-citation');
        const citationElement = document.createElement('div');
        citationElement.textContent = citationText;
        citationElement.id = `citation-${index}`;
        citationElement.classList.add('citation-text');
        citationsColumn.appendChild(citationElement);

        // Position the citation
        function positionCitation() {
            const rect = citation.getBoundingClientRect();
            const citationRect = citationElement.getBoundingClientRect();
            citationElement.style.top = `${rect.top + window.scrollY}px`;
        }

        // Initial positioning
        positionCitation();

        // Reposition on window resize
        window.addEventListener('resize', positionCitation);
    });

    // Highlight active section in TOC and manage citation visibility
    function updateTOCAndCitations() {
        let currentSection = '';
        headings.forEach((heading, index) => {
            const rect = heading.getBoundingClientRect();
            if (rect.top <= 50) {
                currentSection = `#heading-${index}`;
            }
        });

        tocLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentSection) {
                link.classList.add('active');
            }
        });

        // Manage citation visibility
        const citationTexts = document.querySelectorAll('.citation-text');
        citationTexts.forEach(citationText => {
            const rect = citationText.getBoundingClientRect();
            if (rect.top < window.innerHeight && rect.bottom > 0) {
                citationText.style.opacity = '1';
            } else {
                citationText.style.opacity = '0';
            }
        });
    }

    // Update on scroll
    window.addEventListener('scroll', updateTOCAndCitations);

    // Initial update
    updateTOCAndCitations();
});