document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message and previous options
      activitiesList.innerHTML = "";

      // Reset activity select to avoid duplicates
      activitySelect.innerHTML = '<option value="" disabled selected>Sélectionnez une activité</option>';

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card card";

        const spotsLeft = details.max_participants - details.participants.length;
        const participantsCount = details.participants.length;

        // Build participants HTML: chips with avatar initials or a no-participants message
        let participantsHtml = `<div class="participants">
            <h3>Participants</h3>
            <span class="participants-count">${participantsCount} inscrit${participantsCount > 1 ? "s" : ""}</span>`;

        if (participantsCount > 0) {
          participantsHtml += `<ul class="participants-list">`;
          details.participants.forEach((p) => {
            // attempt to compute initials from name or fallback to email prefix
            const displayName = p.name || p.email || "Participant";
            const initials = (displayName.split(" ").map(s => s[0]).join("").slice(0,2)).toUpperCase();
            participantsHtml += `
              <li>
                <span class="avatar">${initials}</span>
                <span class="name">${displayName}</span>
              </li>`;
          });
          participantsHtml += `</ul>`;
        } else {
          participantsHtml += `<p class="no-participants">Personne n'est encore inscrit — soyez le premier !</p>`;
        }
        participantsHtml += `</div>`;

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHtml}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();

        // Refresh activities to update participants and availability
        fetchActivities();
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
});
