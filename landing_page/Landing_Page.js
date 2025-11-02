// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background change on scroll
window.addEventListener('scroll', function () {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    }
});

// Add fade-in animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function (entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all cards and sections
document.querySelectorAll('.vision-card, .team-member, .contact-card, .about-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});


// Card data
const cardData = [
    {
        title: "AI-Powered Focus Tracking",
        description: "Stay in the zone. Hazel monitors your eye movement and gently alerts you with light and sound if you get distracted, keeping you on task."
    },
    {
        title: "Smart Revision Sessions",
        description: "Upload your study materials and let Hazel instantly generate practice questions, interactive Q&A sessions, and concise summaries to help you revise smarter."
    },
    {
        title: "Interactive Entertainment",
        description: "Challenge your assistant to a 'Music Maze' or 'Guess the Word.' Co-create a unique story, with smart RGB LEDs providing instant feedback."
    },
    {
        title: "Ambient Task Management",
        description: "Set reminders for calls and assignments while Hazel's adaptive lighting creates the perfect mood, automatically syncing with the weather and time of day."
    },
];

let currentIndex = 0;
const cardsWrapper = document.getElementById('cardsWrapper');
const dotsContainer = document.getElementById('dotsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');

// Initialize cards
function initializeCards() {
    cardsWrapper.innerHTML = '';
    dotsContainer.innerHTML = '';

    cardData.forEach((card, index) => {
        // Create card
        const cardElement = document.createElement('div');
        cardElement.className = 'slider-card';
        cardElement.innerHTML = `
                    <div class="card-content">
                        <h3 class="card-title">${card.title}</h3>
                        <p class="card-description">${card.description}</p>
                    </div>
                `;
        cardElement.addEventListener('click', () => goToSlide(index));
        cardsWrapper.appendChild(cardElement);

        // Create dot
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.addEventListener('click', () => goToSlide(index));
        dotsContainer.appendChild(dot);
    });

    updateCards();
}

// Update card positions
function updateCards() {
    const cards = document.querySelectorAll('.slider-card');
    const dots = document.querySelectorAll('.dot');
    const totalCards = cards.length;

    cards.forEach((card, index) => {
        card.className = 'slider-card';

        const position = (index - currentIndex + totalCards) % totalCards;

        if (position === 0) {
            card.classList.add('center-card');
        } else if (position === 1 || position === totalCards - 1) {
            if (position === 1) {
                card.classList.add('right-card');
            } else {
                card.classList.add('left-card');
            }
        } else if (position < totalCards / 2) {
            card.classList.add('hidden-right');
        } else {
            card.classList.add('hidden-left');
        }
    });

    // Update dots
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentIndex);
    });
}

// Navigation functions
function nextSlide() {
    currentIndex = (currentIndex + 1) % cardData.length;
    updateCards();
}

function prevSlide() {
    currentIndex = (currentIndex - 1 + cardData.length) % cardData.length;
    updateCards();
}

function goToSlide(index) {
    currentIndex = index;
    updateCards();
}

// Event listeners
nextBtn.addEventListener('click', nextSlide);
prevBtn.addEventListener('click', prevSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Auto-play (optional)
let autoplayInterval;
function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 4000);
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
}

// Pause autoplay on hover
cardsWrapper.addEventListener('mouseenter', stopAutoplay);
cardsWrapper.addEventListener('mouseleave', startAutoplay);

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

cardsWrapper.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
});

cardsWrapper.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
}

// Initialize
initializeCards();
startAutoplay();