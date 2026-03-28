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
    if (!navbar) return;

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
        title: "Focus & Monitoring",
        description: "Drowsiness Alerts offer gentle cues when you are getting tired, Phone Police minimizes smartphone distractions, Posture Check supports healthier sitting habits, and Privacy Turn enables a secure mode for sensitive tasks."
    },
    {
        title: "Environment & Bio-Hacks",
        description: "Air Quality Alerts track your room air quality, Smart Aromatherapy boosts mood and focus through AI-driven scents, and Circadian Lighting adapts room lighting to your natural energy cycles."
    },
    {
        title: "Learning & Tutoring",
        description: "Snap & Quiz turns notes and images into interactive quizzes, Oral Exam Practice simulates oral tests for confidence and retention, and Smart Revision Sessions generate practice questions, summaries, and Q&A."
    },
    {
        title: "Music & Entertainment",
        description: "Gesture Music Control lets you control playlists with simple hand gestures, Music Visualizer creates RGB visuals synced to your tracks, and Scent DJ pairs aromas with music for an immersive experience."
    },
    {
        title: "Games & Wellness",
        description: "Scent Trivia adds multisensory knowledge challenges, Emotion Charades helps build emotional intelligence, Retro Screen Games create fun short breaks, and Guided Breathwork reduces stress with AI-led breathing sessions."
    },
    {
        title: "App & Integration",
        description: "Focus Heatmap visualizes productivity patterns, Voice Notes capture reminders and ideas, and Smart Reminders deliver context-aware alerts for tasks and deadlines."
    },
    {
        title: "Interactive Entertainment",
        description: "Play Music Maze and Guess the Word, co-create stories, and use Adaptive Lighting & Mood so Hazel adjusts your environment to your activities and time of day."
    },
];

let currentIndex = 0;
const cardsWrapper = document.getElementById('cardsWrapper');
const dotsContainer = document.getElementById('dotsContainer');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
if (nextBtn) nextBtn.addEventListener('click', nextSlide);
if (prevBtn) prevBtn.addEventListener('click', prevSlide);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
});

// Auto-play (optional)
let autoplayInterval;
function startAutoplay() {
    autoplayInterval = setInterval(nextSlide, 3000);
}

function stopAutoplay() {
    clearInterval(autoplayInterval);
}

// Pause autoplay on hover
if (cardsWrapper) {
    cardsWrapper.addEventListener('mouseenter', stopAutoplay);
    cardsWrapper.addEventListener('mouseleave', startAutoplay);
}

// Touch/swipe support
let touchStartX = 0;
let touchEndX = 0;

if (cardsWrapper) {
    cardsWrapper.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    cardsWrapper.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    if (touchEndX < touchStartX - 50) nextSlide();
    if (touchEndX > touchStartX + 50) prevSlide();
}

// Initialize
if (cardsWrapper && dotsContainer) {
    initializeCards();

    if (!prefersReducedMotion) {
        startAutoplay();

        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                stopAutoplay();
            } else {
                startAutoplay();
            }
        });
    }
}