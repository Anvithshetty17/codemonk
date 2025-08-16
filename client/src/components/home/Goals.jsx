import './Goals.css';

const goalsData = [
  {
    icon: '🎯',
    title: 'Empower Students',
    description: 'Equip MCA Students with the skills and knowledge necessary for future success'
  },
  {
    icon: '💡',
    title: 'Foster Innovation',
    description: 'Encourage creativity through coding challenges, competition and innovation projects.'
  },
  {
    icon: '🤝',
    title: 'Promote Collaboration',
    description: 'Build supportive community where MCA students can collaborate, share knowledge and support each other.'
  },
  {
    icon: '💼',
    title: 'Enhance Employability',
    description: 'Prepare students for successful careers by providing practical experiences and skill development.'
  }
];

const Goals = () => {
  return (
    <section className="goals">
      <div className="container">
        <div className="section-header">
          <h2>Our Goals</h2>
          <p>What we aim to achieve with Code Monk</p>
        </div>
        <div className="grid grid-cols-4 goals-grid">
          {goalsData.map((goal, index) => (
            <div key={index} className="goal-card">
              <div className="goal-icon">{goal.icon}</div>
              <h3 className="goal-title">{goal.title}</h3>
              <p className="goal-description">{goal.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Goals;
