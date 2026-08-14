// Add simple interactivity and animations
document.addEventListener('DOMContentLoaded', () => {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth'
        });
      }
    });
  });

  // Simple intersection observer for feature cards (reveal on scroll)
  const cards = document.querySelectorAll('.feature-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  cards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(30px)';
    card.style.transition = 'all 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    observer.observe(card);
  });

  // Lanyard API Integration
  const creatorsIds = ['1526342738012934286', '1017829096903950346'];
  const creatorsGrid = document.getElementById('creators-grid');

  async function fetchLanyardData() {
    if (!creatorsGrid) return; // Güvenlik kontrolü
    try {
      creatorsGrid.innerHTML = ''; // Clear loading state

      for (const id of creatorsIds) {
        const response = await fetch(`https://api.lanyard.rest/v1/users/${id}`);
        const data = await response.json();
        
        if (data.success) {
          const user = data.data;
          renderCreatorCard(user);
        } else {
          console.error('Lanyard error:', data);
        }
      }
    } catch (error) {
      console.error('Error fetching Lanyard data:', error);
      creatorsGrid.innerHTML = '<p style="text-align: center; width: 100%;">Geliştirici bilgileri yüklenemedi.</p>';
    }
  }

  function renderCreatorCard(data) {
    const discordUser = data.discord_user;
    const discordStatus = data.discord_status;
    const activities = data.activities.filter(a => a.type !== 4); // Filter out custom status
    const customStatus = data.activities.find(a => a.type === 4);

    const avatarUrl = discordUser.avatar 
      ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png?size=256` 
      : 'https://cdn.discordapp.com/embed/avatars/0.png';

    let activityHtml = '';
    if (activities.length > 0) {
      const activity = activities[0]; // Sadece ilk aktiviteyi göster
      const imageUrl = activity.assets && activity.assets.large_image 
        ? (activity.assets.large_image.startsWith('mp:external/') ? `https://media.discordapp.net/external/${activity.assets.large_image.replace('mp:external/', '')}` : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.large_image}.png`)
        : '';
        
      activityHtml = `
        <div class="creator-activities">
          <div class="activity">
            ${imageUrl ? `<img src="${imageUrl}" alt="Activity" />` : ''}
            <div>
              <strong>${activity.name}</strong><br>
              ${activity.details || ''}
            </div>
          </div>
        </div>
      `;
    }

    const cardHtml = `
      <div class="creator-card">
        <div class="creator-avatar-wrapper">
          <img src="${avatarUrl}" alt="${discordUser.username}" class="creator-avatar">
          <div class="status-indicator status-${discordStatus}"></div>
        </div>
        <div class="creator-info">
          <h3>${discordUser.global_name || discordUser.username}</h3>
          <p>@${discordUser.username}</p>
          ${customStatus && customStatus.state ? `<p style="margin-top: 5px; font-style: italic;">"${customStatus.state}"</p>` : ''}
        </div>
        ${activityHtml}
      </div>
    `;

    creatorsGrid.insertAdjacentHTML('beforeend', cardHtml);
  }

  fetchLanyardData();
});
