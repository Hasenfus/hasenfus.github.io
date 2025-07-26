document.addEventListener('DOMContentLoaded', async (event) => {
    const postContainer = document.getElementById('post-container');
    const citationsColumn = document.querySelector('.citations');
    const toc = document.getElementById('TOC');

    async function loadAllPosts() {
        try {
            console.log('Starting to load posts...');
            const response = await fetch('./essays.json');
            const files = await response.json();
            
            // Sort files by number prefix
            const postFiles = files
                .filter(file => /^\d+\..*\.html$/.test(file))
                .sort((a, b) => {
                    const numA = parseInt(a.split('.')[0]);
                    const numB = parseInt(b.split('.')[0]);
                    return numA - numB;
                });

            // Load each post
            for (const file of postFiles) {
                const postResponse = await fetch(`./essays/${file}`);
                const postContent = await postResponse.text();
                
                const temp = document.createElement('div');
                temp.innerHTML = postContent;
                
                // Add the post content
                postContainer.appendChild(temp.firstElementChild);
            }

            // After all posts are loaded, initialize TOC and citations
            initializeEssayFeatures();

        } catch (error) {
            console.error('Error loading posts:', error);
            postContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        }
    }

    function initializeEssayFeatures() {
        const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const tocLinks = [];
        
        // Clear existing TOC
        toc.innerHTML = '<h2>Contents</h2><ul></ul>';
        const tocList = toc.querySelector('ul');

        // Generate table of contents and prepare headings
        headings.forEach((heading, index) => {
            // Create TOC entry
            const link = document.createElement('a');
            link.textContent = heading.textContent;
            link.href = `#heading-${index}`;
            
            const li = document.createElement('li');
            li.classList.add(`toc-level-${heading.tagName.toLowerCase()}`);
            li.appendChild(link);
            tocList.appendChild(li);
            tocLinks.push(link);

            // Set heading ID
            heading.id = `heading-${index}`;
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
                const containerRect = citationsColumn.getBoundingClientRect();
                const relativeTop = rect.top - containerRect.top;
                citationElement.style.top = `${relativeTop}px`;
            }

            // Initial positioning
            positionCitation();

            // Reposition on window resize
            window.addEventListener('resize', positionCitation);
        });

        // Smooth scrolling for TOC links
        tocLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                const targetElement = document.querySelector(targetId);
                targetElement.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, targetId);
            });
        });

        function updateTOCAndCitations() {
            const scrollPosition = window.scrollY;
            const viewportHeight = window.innerHeight;
            const scrollThreshold = 100; // Pixels from top of viewport

            // Find the heading that's currently in view
            let activeHeading = null;
            let minDistance = Infinity;

            headings.forEach((heading) => {
                const rect = heading.getBoundingClientRect();
                const distanceFromThreshold = rect.top - scrollThreshold;
                
                // Consider headings that are above or slightly below the threshold
                if (distanceFromThreshold <= 0) {
                    // Find the heading closest to the threshold
                    if (Math.abs(distanceFromThreshold) < minDistance) {
                        minDistance = Math.abs(distanceFromThreshold);
                        activeHeading = heading;
                    }
                }
            });

            // Update TOC highlighting
            tocLinks.forEach(link => {
                link.classList.remove('active');
                if (activeHeading && link.getAttribute('href') === `#${activeHeading.id}`) {
                    link.classList.add('active');
                }
            });

            // Update citations visibility
            const citations = document.querySelectorAll('.citation');
            const containerRect = citationsColumn.getBoundingClientRect();
            
            citations.forEach((citation, index) => {
                const citationText = document.getElementById(`citation-${index}`);
                if (citationText) {
                    const rect = citation.getBoundingClientRect();
                    const relativeTop = rect.top - containerRect.top;
                    
                    citationText.style.top = `${relativeTop}px`;
                    citationText.style.opacity = (rect.top < viewportHeight && rect.bottom > 0) ? '1' : '0';
                }
            });
        }

        // Add scroll event listener with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTOCAndCitations();
                    ticking = false;
                });
                ticking = true;
            }
        });

        // Initial update
        updateTOCAndCitations();
    }

    // Start loading posts
    await loadAllPosts();
});