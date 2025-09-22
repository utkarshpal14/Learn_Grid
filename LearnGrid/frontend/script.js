document.addEventListener('DOMContentLoaded', () => {
    // Get references to all HTML elements
    const skillForm = document.getElementById('skill-form');
    const skillInput = document.getElementById('skill-input');
    const roadmapContainer = document.getElementById('roadmap-container');
    const loader = document.getElementById('loading-spinner');
    
    // Quiz Modal elements
    const quizModal = document.getElementById('quiz-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const quizTopic = document.getElementById('quiz-topic');
    const quizQuestion = document.getElementById('quiz-question');
    const quizOptionsContainer = document.getElementById('quiz-options');
    const quizFeedback = document.getElementById('quiz-feedback');

    const API_BASE_URL = 'http://127.0.0.1:5000';

    // Main form submission logic
    skillForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const skill = skillInput.value.trim();
        if (!skill) return;

        roadmapContainer.innerHTML = '';
        loader.classList.remove('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/roadmap?skill=${encodeURIComponent(skill)}`);
            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.error || 'An unknown error occurred.');
            }
            displayRoadmap(data);
        } catch (error) {
            console.error('Error fetching roadmap:', error);
            displayError(`Failed to generate roadmap. ${error.message}`);
        } finally {
            loader.classList.add('hidden');
        }
    });

    // UPDATED displayRoadmap function
    function displayRoadmap(data) {
        roadmapContainer.innerHTML = ''; // Clear previous content
        const header = document.createElement('h2');
        header.className = 'roadmap-header';
        header.innerHTML = `Learning Path for <span>${data.skill}</span>`;
        roadmapContainer.appendChild(header);

        data.modules.forEach(module => {
            const moduleDiv = createModuleElement(module);
            roadmapContainer.appendChild(moduleDiv);
        });
    }

    function createModuleElement(module) {
        const moduleDiv = document.createElement('div');
        moduleDiv.className = 'module';
        
        const moduleHeader = document.createElement('div');
        moduleHeader.className = 'module-header';
        moduleHeader.textContent = module.title;
        
        const moduleContent = document.createElement('div');
        moduleContent.className = 'module-content';
        
        const subtopicList = document.createElement('ul');
        subtopicList.className = 'subtopic-list';

        module.subtopics.forEach(subtopic => {
            subtopicList.appendChild(createSubtopicElement(subtopic));
        });
        
        moduleContent.appendChild(subtopicList);
        moduleDiv.appendChild(moduleHeader);
        moduleDiv.appendChild(moduleContent);

        moduleHeader.addEventListener('click', () => {
            moduleDiv.classList.toggle('active');
            moduleContent.style.maxHeight = moduleContent.style.maxHeight ? null : moduleContent.scrollHeight + "px";
        });

        return moduleDiv;
    }

    function createSubtopicElement(subtopic) {
        const listItem = document.createElement('li');
        const titleSpan = document.createElement('span');
        titleSpan.textContent = subtopic.title;
        
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'resources-container';

        // NEW: Dynamically create links for all available resources
        for (const [platform, query] of Object.entries(subtopic.resources)) {
            const link = createResourceLink(platform, query);
            if (link) buttonsContainer.appendChild(link);
        }

        // NEW: Add the quiz button
        const quizBtn = document.createElement('button');
        quizBtn.className = 'quiz-btn';
        quizBtn.textContent = 'Quiz Me!';
        quizBtn.onclick = () => fetchAndShowQuiz(subtopic.title);
        buttonsContainer.appendChild(quizBtn);

        listItem.appendChild(titleSpan);
        listItem.appendChild(buttonsContainer);
        return listItem;
    }

    function createResourceLink(platform, query) {
        const link = document.createElement('a');
        link.className = `resource-link ${platform}`;
        link.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
        link.target = '_blank';
        
        switch (platform) {
            case 'youtube':
                link.href = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
                break;
            case 'udemy':
                link.href = `https://www.udemy.com/courses/search/?src=ukw&q=${encodeURIComponent(query)}`;
                break;
            case 'coursera':
                link.href = `https://www.coursera.org/search?query=${encodeURIComponent(query)}`;
                break;
            case 'articles':
                link.href = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
                break;
            default:
                return null;
        }
        return link;
    }

    // --- NEW Quiz Functionality ---
    async function fetchAndShowQuiz(topic) {
        quizTopic.textContent = `Quiz: ${topic}`;
        quizQuestion.textContent = 'Loading question...';
        quizOptionsContainer.innerHTML = '';
        quizFeedback.classList.add('hidden');
        quizModal.classList.remove('hidden');

        try {
            const response = await fetch(`${API_BASE_URL}/api/quiz?topic=${encodeURIComponent(topic)}`);
            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.error);
            displayQuiz(data);
        } catch (error) {
            quizQuestion.textContent = `Could not load quiz. ${error.message}`;
        }
    }

    function displayQuiz(quizData) {
        quizQuestion.textContent = quizData.question;
        quizOptionsContainer.innerHTML = '';
        
        quizData.options.forEach(optionText => {
            const optionDiv = document.createElement('div');
            optionDiv.className = 'quiz-option';
            optionDiv.textContent = optionText;
            optionDiv.onclick = () => checkAnswer(optionText, quizData.answer);
            quizOptionsContainer.appendChild(optionDiv);
        });
    }

    function checkAnswer(selectedOption, correctAnswer) {
        quizFeedback.classList.remove('hidden');
        if (selectedOption === correctAnswer) {
            quizFeedback.textContent = 'Correct!';
            quizFeedback.className = 'correct';
        } else {
            quizFeedback.textContent = `Incorrect. The right answer is: ${correctAnswer}`;
            quizFeedback.className = 'incorrect';
        }
        // Disable further clicks
        document.querySelectorAll('.quiz-option').forEach(opt => opt.onclick = null);
    }
    
    closeModalBtn.addEventListener('click', () => quizModal.classList.add('hidden'));

    function displayError(message) {
        roadmapContainer.innerHTML = `<div class="error-message">${message}</div>`;
    }
});