CREATE TABLE IF NOT EXISTS page_views (
                                          id          SERIAL PRIMARY KEY,
                                          page        VARCHAR(100),
    country     VARCHAR(100),
    city        VARCHAR(100),
    ip          VARCHAR(50),
    user_agent  VARCHAR(500),
    visited_at  TIMESTAMP DEFAULT NOW()
    );

CREATE TABLE IF NOT EXISTS resume_downloads (
                                                id            SERIAL PRIMARY KEY,
                                                country       VARCHAR(100),
    ip            VARCHAR(50),
    downloaded_at TIMESTAMP DEFAULT NOW()
    );