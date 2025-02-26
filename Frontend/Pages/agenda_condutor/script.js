import { getApiUrl, getCsrfToken } from '../api.js';

document.addEventListener("DOMContentLoaded", function () {
    const newScheduleButton = document.getElementById('new-schedule-button');
    const newScheduleModal = document.getElementById('new-schedule-modal');
    const rescheduleButtons = document.querySelectorAll('.reschedule-button');
    const rescheduleModal = document.getElementById('reschedule-modal');
    const cancelButtons = document.querySelectorAll('.cancel-button');

    newScheduleButton.addEventListener('click', () => {
        newScheduleModal.classList.remove('hidden');
    });

    rescheduleButtons.forEach(button => {
        button.addEventListener('click', () => {
            rescheduleModal.classList.remove('hidden');
        });
    });

    cancelButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').classList.add('hidden');
        });
    });

    // Função para criar um novo agendamento
    async function createSchedule(event) {
        event.preventDefault();

        const date = document.getElementById('date').value;
        const time = document.getElementById('time').value;
        const location = document.getElementById('location').value;

        if (!date || !time || !location) {
            alert("Preencha todos os campos!");
            return;
        }

        const csrfToken = getCsrfToken();

        try {
            const response = await fetch(getApiUrl('/create-schedule'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ date, time, location })
            });

            if (!response.ok) {
                throw new Error("Erro ao criar agendamento");
            }

            alert("Agendamento criado com sucesso!");
            newScheduleModal.classList.add('hidden');
            // Atualizar a lista de agendamentos aqui, se necessário

        } catch (error) {
            alert(error.message);
        }
    }

    // Função para reagendar
    async function reschedule(event) {
        event.preventDefault();

        const newDate = document.getElementById('new-date').value;
        const newTime = document.getElementById('new-time').value;

        if (!newDate || !newTime) {
            alert("Preencha todos os campos!");
            return;
        }

        const csrfToken = getCsrfToken();

        try {
            const response = await fetch(getApiUrl('/reschedule'), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': csrfToken
                },
                body: JSON.stringify({ newDate, newTime })
            });

            if (!response.ok) {
                throw new Error("Erro ao reagendar");
            }

            alert("Reagendamento realizado com sucesso!");
            rescheduleModal.classList.add('hidden');
            // Atualizar a lista de agendamentos aqui, se necessário

        } catch (error) {
            alert(error.message);
        }
    }

    // Adicionar ouvintes de evento aos formulários
    document.querySelector('#new-schedule-modal form').addEventListener('submit', createSchedule);
    document.querySelector('#reschedule-modal form').addEventListener('submit', reschedule);
});