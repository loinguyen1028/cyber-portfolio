// Dữ liệu mặc định lấy từ CV — sửa nội dung portfolio tại đây
export const DEFAULT_PORTFOLIO_DATA = {
  hero: {
    badge: 'CYBERSECURITY INTERN / FRESHER',
    tagline: 'BẢO VỆ KHÔNG GIAN SỐ //',
    firstName: 'NGUYỄN',
    lastName: 'PHƯỚC LỢI',
    roleBadge: 'Cybersecurity Intern / Fresher',
    roleSubtitle: '(An ninh mạng • SOC Monitoring & Incident Detection)',
    bio: 'Sinh viên năm cuối ngành Công nghệ thông tin, định hướng An ninh mạng. Đam mê giám sát, phát hiện sự cố và ứng dụng AI vào phòng thủ mạng.',
    ctaPrimary: 'Xem Dự Án',
    ctaSecondary: 'Liên Hệ',
    avatarImage: 'abchdh.jpg',
    bgOpacity: 0.85,
    bgBrightness: 0.28,
    bgBlur: 0,
    hudId: 'ID // NPL-1028',
    metrics: [
      { label: 'TRỌNG TÂM CHÍNH', value: 'SOC & IDS/IPS', color: 'text-cyan-400' },
      { label: 'NGHIÊN CỨU', value: 'AI Anomaly IPS', color: 'text-emerald-400' },
      { label: 'TỐT NGHIỆP', value: '07 / 2027', color: 'text-purple-400' }
    ],
    orbitBadges: [
      { label: 'Wazuh SIEM', pos: '-top-4 -left-6 sm:-left-10', color: 'border-cyan-400/50 text-cyan-300', delay: '0s' },
      { label: 'Suricata & Zeek', pos: 'top-12 -right-6 sm:-right-12', color: 'border-emerald-400/50 text-emerald-300', delay: '1.2s' },
      { label: 'AI Anomaly IPS', pos: '-bottom-4 -left-4 sm:-left-8', color: 'border-purple-400/50 text-purple-300', delay: '2.1s' },
      { label: 'pfSense & Slips', pos: 'bottom-8 -right-4 sm:-right-10', color: 'border-sky-400/50 text-sky-300', delay: '0.7s' }
    ]
  },
  about: {
    heading: 'Định hướng An ninh mạng & Vận hành SOC',
    subheading: 'SOC Analyst • Detection Engineering • AI Security',
    paragraph1:
      'Sinh viên năm cuối ngành Công nghệ thông tin, định hướng chuyên sâu về An ninh mạng, đặc biệt là giám sát và phát hiện sự cố an ninh. Hiện đang thực hiện khóa luận xây dựng mô hình SOC thu nhỏ với Wazuh, Suricata, Zeek, pfSense.',
    paragraph2:
      'Mong muốn tìm vị trí Thực tập sinh (Intern) hoặc Fresher An ninh mạng để áp dụng nền tảng lập trình, mạng máy tính và học máy vào thực tế, đồng thời học hỏi quy trình vận hành an ninh chuyên nghiệp tại doanh nghiệp.',
    pillars: [
      {
        code: '01. GIÁM SÁT',
        text: 'Thu thập log tập trung & phân tích cảnh báo SIEM/IDS.',
        color: 'text-cyan-400'
      },
      {
        code: '02. PHÁT HIỆN',
        text: 'Phân tích gói tin Wireshark, Zeek & hành vi bất thường bằng AI.',
        color: 'text-emerald-400'
      },
      {
        code: '03. PHÒNG THỦ',
        text: 'Cấu hình firewall pfSense, bảo vệ container Kubernetes.',
        color: 'text-purple-400'
      }
    ]
  },
  education: {
    universityBadge: 'TRÌNH ĐỘ HỌC VẤN',
    universityName: 'Đại học Công nghệ Kỹ thuật TP.HCM (HCMUTE)',
    major: 'Công nghệ thông tin (Định hướng An ninh mạng)',
    graduationDate: 'Tháng 07 / 2027',
    language: 'Tiếng Anh — TOEIC 550 (Đọc hiểu tài liệu kỹ thuật)',
    activities: [
      {
        id: 'act-1',
        title: 'Thực hành trên nền tảng TryHackMe',
        badge: 'TỰ HỌC CHỦ ĐỘNG',
        accent: 'purple',
        description:
          'Chủ động rèn luyện kỹ năng Red/Blue Team, giải quyết các thử thách CTF và bài lab thực tế về phân tích sự cố, khai thác lỗ hổng và phòng thủ hệ thống.'
      },
      {
        id: 'act-2',
        title: 'Mô phỏng Tấn công & Phân tích Wireshark',
        badge: 'PHÂN TÍCH GÓI TIN',
        accent: 'cyan',
        description:
          'Thiết lập môi trường Lab thử nghiệm để mô phỏng các kịch bản tấn công mạng và trực tiếp quan sát, bóc tách lưu lượng bằng Wireshark nhằm nắm vững dấu hiệu nhận diện (Indicators/Signatures) của từng kiểu tấn công.'
      }
    ]
  },
  skillCategories: [
    {
      id: 'cat-cyber',
      title: 'An Ninh Mạng & Giám Sát SOC',
      subtitle: 'PHÒNG THỦ MẠNG & AN NINH HỆ THỐNG',
      iconName: 'Shield',
      theme: 'cyan',
      description:
        'Nền tảng vững chắc về các loại tấn công mạng và phương pháp phòng thủ; triển khai hệ thống giám sát và phân tích lưu lượng sâu.',
      skills: [
        { name: 'Wazuh (SIEM/XDR)', level: 'Trọng tâm Khóa luận' },
        { name: 'Suricata & Zeek (NIDS)', level: 'Giám sát & DPI' },
        { name: 'pfSense Firewall', level: 'Kiểm soát biên mạng' },
        { name: 'Slips (ML Behavioral IDS)', level: 'Phát hiện bất thường' },
        { name: 'Wireshark', level: 'Phân tích gói tin PCAP' },
        { name: 'Attack & Defense Analysis', level: 'Mô phỏng & Ứng phó sự cố' }
      ]
    },
    {
      id: 'cat-code',
      title: 'Lập Trình & Phát Triển',
      subtitle: 'PHẦN MỀM & TỰ ĐỘNG HÓA',
      iconName: 'Code2',
      theme: 'emerald',
      description:
        'Xây dựng công cụ tự động hóa, tích hợp thuật toán trí tuệ nhân tạo và phát triển ứng dụng đa nền tảng.',
      skills: [
        { name: 'Python', level: 'AI / Security Scripting' },
        { name: 'Java', level: 'Core & OOP Application' },
        { name: 'Lập trình Web', level: 'Frontend & Backend' },
        { name: 'Bash / Linux CLI', level: 'Triển khai Lab & Server' },
        { name: 'Kubernetes Security', level: 'Container Defense' },
        { name: 'Git / GitHub', level: 'Quản lý mã nguồn' }
      ]
    },
    {
      id: 'cat-ai',
      title: 'AI, IoT & Kỹ Năng Bổ Trợ',
      subtitle: 'TRÍ TUỆ NHÂN TẠO & KỸ THUẬT NỀN TẢNG',
      iconName: 'Cpu',
      theme: 'purple',
      description:
        'Kết hợp học máy vào phát hiện bất thường mạng, xây dựng giải pháp phần cứng IoT và làm việc nhóm hiệu quả.',
      skills: [
        { name: 'Học máy & AI cơ bản', level: 'Anomaly Detection / Game AI' },
        { name: 'Internet of Things (IoT)', level: 'Smart Classroom Sensor' },
        { name: 'Thiết kế Hướng đối tượng (OOP)', level: 'Kiến trúc phần mềm' },
        { name: 'Làm việc nhóm (Teamwork)', level: 'Phối hợp dự án SOC' },
        { name: 'Tiếng Anh (TOEIC 550)', level: 'Đọc hiểu tài liệu kỹ thuật' },
        { name: 'TryHackMe Lab', level: 'Tự học & Thực hành' }
      ]
    }
  ],
  projects: [
    {
      id: 'soc-thesis',
      badge: 'DỰ ÁN KHÓA LUẬN TỐT NGHIỆP // TIÊU BIỂU',
      title: 'Xây dựng mô hình SOC thu nhỏ tích hợp IDS/IPS & AI',
      period: 'Đang thực hiện (Khóa luận)',
      featured: true,
      iconName: 'Shield',
      accentColor: 'cyan',
      tech: ['Wazuh', 'Suricata', 'Zeek', 'pfSense', 'Slips', 'AI Anomaly IPS', 'Kubernetes'],
      summary:
        'Hệ thống Trung tâm Điều hành An ninh mạng (Mini-SOC) tích hợp IDS/IPS phục vụ giám sát, phát hiện và ứng phó sự cố an ninh mạng toàn diện.',
      highlights: [
        'Nghiên cứu và phân loại các hình thức tấn công mạng phổ biến để làm cơ sở xây dựng kịch bản giám sát và phát hiện.',
        'Nghiên cứu hướng thay thế / bổ sung IPS truyền thống bằng mô hình AI trong phát hiện bất thường (Anomaly Detection).',
        'Tìm hiểu Kubernetes và các phương pháp phòng thủ chuyên sâu cho môi trường container.',
        'Tổng hợp và đánh giá các biện pháp phòng thủ, phục vụ thiết kế quy trình ứng phó sự cố (Incident Response).'
      ]
    },
    {
      id: 'pacman-ai',
      badge: 'DỰ ÁN MÔN HỌC TIÊU BIỂU // GAME AI',
      title: 'Game Pacman ứng dụng Trí tuệ Nhân tạo',
      period: '2025',
      featured: false,
      iconName: 'Sparkles',
      accentColor: 'emerald',
      tech: ['Python', 'Artificial Intelligence', 'Search Algorithms', 'Game Dev'],
      summary:
        'Xây dựng và phát triển game Pacman hoàn chỉnh, áp dụng các thuật toán trí tuệ nhân tạo vào tìm đường, né tránh và ra quyết định thông minh.',
      highlights: [
        'Thiết kế tác tử (Agent) thông minh sử dụng thuật toán tìm kiếm và lượng giá trạng thái.',
        'Tối ưu hóa tốc độ phản hồi và hành vi của Ghost & Pacman trong môi trường động.'
      ]
    },
    {
      id: 'hand-tracking-3d',
      badge: 'DỰ ÁN MÔN HỌC TIÊU BIỂU // COMPUTER VISION',
      title: 'Điều khiển mô hình 3D bằng thuật toán Hand Tracking',
      period: 'Dự án tiêu biểu',
      featured: false,
      iconName: 'Eye',
      accentColor: 'purple',
      tech: ['Hand Tracking', 'Computer Vision', '3D Model Control', 'Python'],
      summary:
        'Xây dựng ứng dụng tương tác không chạm, cho phép điều khiển mô hình 3D bằng cử chỉ bàn tay theo thời gian thực thông qua thuật toán theo dõi bàn tay.',
      highlights: [
        'Nhận diện khớp ngón tay và cử chỉ không gian với độ trễ thấp.',
        'Ánh xạ tọa độ bàn tay sang các phép biến đổi xoay, thu phóng mô hình 3D mượt mà.'
      ]
    },
    {
      id: 'smart-classroom-iot',
      badge: 'DỰ ÁN MÔN HỌC TIÊU BIỂU // IOT THÔNG MINH',
      title: 'Hệ thống chấm điểm phòng học thông minh',
      period: '2025',
      featured: false,
      iconName: 'Wifi',
      accentColor: 'sky',
      tech: ['IoT Devices', 'Data Processing', 'Sensors', 'Automation'],
      summary:
        'Kết hợp thiết bị kết nối phần cứng và xử lý dữ liệu tự động để xây dựng giải pháp IoT hoàn chỉnh cho việc đánh giá và chấm điểm phòng học thông minh.',
      highlights: [
        'Thu thập dữ liệu môi trường & trạng thái phòng học từ mạng lưới cảm biến IoT.',
        'Đồng bộ và xử lý dữ liệu tập trung để tự động hóa quy trình đánh giá tiêu chuẩn.'
      ]
    }
  ],
  contact: {
    email: 'phuocloi1023@gmail.com',
    phone: '0337601937',
    phoneDisplay: '0337 601 937',
    location: 'TP. Hồ Chí Minh, Việt Nam',
    workMode: 'TRỰC TIẾP / HYBRID',
    github: 'github.com/loinguyen1028',
    githubUrl: 'https://github.com/loinguyen1028'
  },
  physics: {
    particleSpeed: 1.65,
    particleDensity: 110,
    tiltIntensity: 7,
    attractionRadius: 340,
    attractionForce: 0.48
  }
};
