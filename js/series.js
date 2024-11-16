document.addEventListener('DOMContentLoaded', async (event) => {
    const postContainer = document.getElementById('post-container');
    const citationsColumn = document.querySelector('.citations');
    const toc = document.getElementById('TOC');
    let currentPage = 1;
    let allPosts = [];

    console.log('Script loaded, elements found:', {
        postContainer: !!postContainer,
        citationsColumn: !!citationsColumn,
        toc: !!toc
    });

    async function loadPostMetadata() {
        try {
            console.log('Attempting to fetch posts.json...');
            const response = await fetch('./posts.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPosts = await response.json();
            console.log('Posts loaded:', allPosts);
            
            // Sort files
            allPosts = allPosts.sort((a, b) => {
                const numA = parseInt(a.match(/\d+/)[0]);
                const numB = parseInt(b.match(/\d+/)[0]);
                return numA - numB;
            });
            console.log('Posts sorted:', allPosts);

            await initializeTOC();
            await loadAllPosts();
        } catch (error) {
            console.error('Error loading post metadata:', error);
            postContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        }
    }

    async function initializeTOC() {
        const toc = document.getElementById('TOC');
        toc.innerHTML = '<h2>Table of Contents</h2>';
        
        const tocList = document.createElement('ul');
        
        for (let index = 0; index < allPosts.length; index++) {
            const li = document.createElement('li');
            const link = document.createElement('a');
            const postNum = index + 1;
            
            link.href = `#page-${postNum}`;
            link.textContent = `Post ${postNum}`;
            link.classList.add('toc-post-link');
            link.addEventListener('click', (e) => {
                e.preventDefault();
                loadPage(postNum);
            });
            
            li.appendChild(link);
            
            try {
                const postResponse = await fetch(`./posts/${allPosts[index]}`);
                const postContent = await postResponse.text();
                const temp = document.createElement('div');
                temp.innerHTML = postContent;
                
                const headers = temp.querySelectorAll('h1, h2, h3, h4, h5, h6');
                
                if (headers.length > 0) {
                    const subList = document.createElement('ul');
                    headers.forEach((header, headerIndex) => {
                        const headerLi = document.createElement('li');
                        const headerLink = document.createElement('a');
                        
                        const headerId = `heading-${postNum}-${headerIndex}`;
                        headerLink.href = `#${headerId}`;
                        headerLink.textContent = header.textContent;
                        headerLink.classList.add(`toc-${header.tagName.toLowerCase()}`);
                        
                        headerLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            loadPage(postNum).then(() => {
                                document.getElementById(headerId)?.scrollIntoView({ behavior: 'smooth' });
                            });
                        });
                        
                        headerLi.appendChild(headerLink);
                        subList.appendChild(headerLi);
                    });
                    li.appendChild(subList);
                }
            } catch (error) {
                console.error(`Error loading headers for post ${postNum}:`, error);
            }
            
            tocList.appendChild(li);
        }
        
        toc.appendChild(tocList);

        // Add scroll event listener with throttling
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    updateTOCHighlight();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }

    function getPageNumFromHash() {
        const hash = window.location.hash;
        return parseInt(hash.substring(1));
    }
    function updateNavigationButtons() {
        const prevButton = document.querySelector('.prev-post');
        const nextButton = document.querySelector('.next-post');

        if (prevButton) {
            prevButton.style.display = currentPage > 1 ? 'inline' : 'none';
            if (currentPage > 1) {
                prevButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    loadPage(currentPage - 1);
                });
            }
        }

        if (nextButton) {
            nextButton.style.display = currentPage < allPosts.length ? 'inline' : 'none';
            if (currentPage < allPosts.length) {
                nextButton.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    loadPage(currentPage + 1);
                });
            }
        }
    }

    function initializeEssayFeatures() {
        const content = document.querySelector('.content');
        const citationsColumn = document.querySelector('.citations');
        const citations = document.querySelectorAll('.citation');

        citations.forEach((citation, index) => {
            const citationText = citation.getAttribute('data-citation');
            const citationElement = document.createElement('div');
            citationElement.textContent = citationText;
            citationElement.id = `citation-${index}`;
            citationElement.classList.add('citation-text');
            citationsColumn.appendChild(citationElement);

            const positionCitation = () => {
                const rect = citation.getBoundingClientRect();
                citationElement.style.top = `${rect.top + window.scrollY}px`;
            };

            positionCitation();
            window.addEventListener('resize', positionCitation);
        });

        const updateCitationVisibility = () => {
            const citationTexts = document.querySelectorAll('.citation-text');
            citationTexts.forEach(citationText => {
                const rect = citationText.getBoundingClientRect();
                citationText.style.opacity = 
                    rect.top < window.innerHeight && rect.bottom > 0 ? '1' : '0';
            });
        };

        window.addEventListener('scroll', updateCitationVisibility);
        updateCitationVisibility();
    }

    async function loadAllPosts() {
        try {
            console.log('Loading all posts...');
            postContainer.innerHTML = '';
            citationsColumn.innerHTML = '';
            
            // Create wrapper for all posts
            const allPostsWrapper = document.createElement('div');
            allPostsWrapper.className = 'all-posts-wrapper';

            // Load each post
            for (let i = 0; i < allPosts.length; i++) {
                const file = allPosts[i];
                const pageNum = i + 1;
                
                console.log(`Fetching post file: ./posts/${file}`);
                const postResponse = await fetch(`./posts/${file}`);
                if (!postResponse.ok) {
                    throw new Error(`HTTP error! status: ${postResponse.status}`);
                }
                const postContent = await postResponse.text();
                
                const postDiv = document.createElement('div');
                postDiv.className = 'post';
                postDiv.id = `page-${pageNum}`;
                postDiv.innerHTML = postContent;
                
                // Add IDs to all headers
                const headers = postDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
                headers.forEach((header, index) => {
                    header.id = `heading-${pageNum}-${index}`;
                });
                
                // Add separator between posts
                if (i > 0) {
                    const separator = document.createElement('hr');
                    separator.className = 'post-separator';
                    allPostsWrapper.appendChild(separator);
                }
                
                allPostsWrapper.appendChild(postDiv);
            }

            postContainer.appendChild(allPostsWrapper);
            initializeEssayFeatures();
            updateTOCHighlight();

        } catch (error) {
            console.error('Error loading posts:', error);
            postContainer.innerHTML = '<p>Error loading posts. Please try again later.</p>';
        }
    }

    async function loadPage(pageNum) {
        const targetPost = document.getElementById(`page-${pageNum}`);
        if (targetPost) {
            targetPost.scrollIntoView({ behavior: 'smooth' });
            window.history.pushState(null, null, `#page-${pageNum}`);
            currentPage = pageNum;
            updateNavigationButtons();
            updateTOCHighlight();
        }
    }

    function updateTOCHighlight() {
        // Remove all active classes
        const allTocLinks = document.querySelectorAll('#TOC a');
        allTocLinks.forEach(link => link.classList.remove('active'));
        
        // Find current section
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
        const scrollPosition = window.scrollY + 100;
        
        let currentHeader = null;
        headers.forEach(header => {
            if (header.offsetTop <= scrollPosition) {
                currentHeader = header;
            }
        });

        if (currentHeader) {
            const correspondingLink = document.querySelector(`#TOC a[href="#${currentHeader.id}"]`);
            if (correspondingLink) {
                correspondingLink.classList.add('active');
            }
        }
    }

    // Start the loading process
    console.log('Starting load process...');
    await loadPostMetadata();
});