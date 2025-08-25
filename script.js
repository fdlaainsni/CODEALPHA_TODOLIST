class TodoApp {
    constructor() {
        this.tasks = [];
        this.editingTaskId = null;
        this.taskIdCounter = 1;
        
        this.initElements();
        this.bindEvents();
        this.updateStats();
        this.renderTasks();
    }
    
    initElements() {
        this.todoForm = document.getElementById('todoForm');
        this.taskInput = document.getElementById('taskInput');
        this.taskList = document.getElementById('taskList');
        this.totalTasks = document.getElementById('totalTasks');
        this.completedTasks = document.getElementById('completedTasks');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.clearAll = document.getElementById('clearAll');
    }
    
    bindEvents() {
        this.todoForm.addEventListener('submit', (e) => this.handleAddTask(e));
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());
        this.clearAll.addEventListener('click', () => this.clearAllTasks());
    }
    
    handleAddTask(e) {
        e.preventDefault();
        const taskText = this.taskInput.value.trim();
        
        if (taskText) {
            this.addTask(taskText);
            this.taskInput.value = '';
            this.taskInput.focus();
        }
    }
    
    addTask(text) {
        const task = {
            id: this.taskIdCounter++,
            text: text,
            completed: false,
            createdAt: new Date()
        };
        
        this.tasks.unshift(task);
        this.updateStats();
        this.renderTasks();
    }
    
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.updateStats();
            this.renderTasks();
        }
    }
    
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            this.updateStats();
            this.renderTasks();
        }
    }
    
    startEditTask(taskId) {
        this.editingTaskId = taskId;
        this.renderTasks();
    }
    
    saveEditTask(taskId, newText) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task && newText.trim()) {
            task.text = newText.trim();
            this.editingTaskId = null;
            this.renderTasks();
        }
    }
    
    cancelEditTask() {
        this.editingTaskId = null;
        this.renderTasks();
    }
    
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        if (completedCount === 0) {
            alert('No completed tasks to clear!');
            return;
        }
        
        if (confirm(`Clear ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.updateStats();
            this.renderTasks();
        }
    }
    
    clearAllTasks() {
        if (this.tasks.length === 0) {
            alert('No tasks to clear!');
            return;
        }
        
        if (confirm('Clear all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.updateStats();
            this.renderTasks();
        }
    }
    
    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        
        this.totalTasks.textContent = total;
        this.completedTasks.textContent = completed;
    }
    
    renderTasks() {
        this.taskList.innerHTML = '';
        
        if (this.tasks.length === 0) {
            this.taskList.innerHTML = '<li class="empty-state">No tasks yet. Add one above!</li>';
            return;
        }
        
        this.tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            
            if (this.editingTaskId === task.id) {
                li.innerHTML = this.getEditTaskHTML(task);
            } else {
                li.innerHTML = this.getTaskHTML(task);
            }
            
            this.taskList.appendChild(li);
        });
        
        this.bindTaskEvents();
    }
    
    getTaskHTML(task) {
        return `
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} 
                   data-task-id="${task.id}">
            <span class="task-text">${this.escapeHtml(task.text)}</span>
            <div class="task-actions">
                <button class="btn-edit" data-task-id="${task.id}">Edit</button>
                <button class="btn-delete" data-task-id="${task.id}">Delete</button>
            </div>
        `;
    }
    
    getEditTaskHTML(task) {
        return `
            <input type="text" class="task-edit-input" value="${this.escapeHtml(task.text)}" 
                   data-task-id="${task.id}" autofocus>
            <div class="task-actions">
                <button class="btn-save" data-task-id="${task.id}">Save</button>
                <button class="btn-cancel">Cancel</button>
            </div>
        `;
    }
    
    bindTaskEvents() {
        // Checkbox events
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.toggleTask(taskId);
            });
        });
        
        // Edit button events
        document.querySelectorAll('.btn-edit').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.startEditTask(taskId);
            });
        });
        
        // Delete button events
        document.querySelectorAll('.btn-delete').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                this.deleteTask(taskId);
            });
        });
        
        // Save button events
        document.querySelectorAll('.btn-save').forEach(button => {
            button.addEventListener('click', (e) => {
                const taskId = parseInt(e.target.dataset.taskId);
                const input = document.querySelector(`.task-edit-input[data-task-id="${taskId}"]`);
                this.saveEditTask(taskId, input.value);
            });
        });
        
        // Cancel button events
        document.querySelectorAll('.btn-cancel').forEach(button => {
            button.addEventListener('click', () => {
                this.cancelEditTask();
            });
        });
        
        // Enter key to save edit
        document.querySelectorAll('.task-edit-input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    const taskId = parseInt(e.target.dataset.taskId);
                    this.saveEditTask(taskId, e.target.value);
                }
            });
            
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cancelEditTask();
                }
            });
        });
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});