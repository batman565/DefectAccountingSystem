create table role (
    id serial primary key,
    role varchar(100) not null
);

insert into role (role) values ('Руководитель');
insert into role (role) values ('Инженер');
insert into role (role) values ('Менеджер');

create table person (
    id serial primary key,
    role_id int not null default 1,
    login varchar(100) not null unique,
    password varchar not null,
    firstname varchar(30) not null,
    lastname varchar(30) not null,
    foreign key (role_id) references role(id)
);

create table object(
    id serial primary key,
    name varchar(100) not null,
    address varchar(100) not null,
    type varchar(100) not null,
    created_at timestamp default current_timestamp
);

create table status(
    id serial primary key,
    status varchar(30) not null
);

insert into status (status) values ('Новая');
insert into status (status) values ('В работе');
insert into status (status) values ('На проверке');
insert into status (status) values ('Закрыта');
insert into status (status) values ('Отменена');

create table defect(
    id serial primary key,
    name varchar(60) not null,
    object_id int not null,
    status_id int not null default 1,
    regperson_id int not null,
    doperson_id int,
    description text,
    term date not null,
    priority varchar(60) not null,
    created_at timestamp default current_timestamp,
    foreign key (object_id) references object(id) on delete cascade,
    foreign key (status_id) references status(id),
    foreign key (regperson_id) references person(id),
    foreign key (doperson_id) references person(id)
);

create table file(
    id serial primary key,
    filename varchar(100) not null,
    fileweight int not null,
    path varchar(512) not null,
    defectid int not null,
    created_at timestamp default current_timestamp,
    foreign key (defectid) references defect(id) on delete cascade
);

create table comment(
    id serial primary key,
    defectid int not null,
    personid int not null,
    comment text not null,
    created_at timestamp default current_timestamp,
    foreign key (defectid) references defect(id) on delete cascade,
    foreign key (personid) references person(id) 
);

create table historyeditdefect(
    id serial primary key,
    defectid int not null,
    changecolumn varchar(100) not null,
    oldvalue varchar(100),
    newvalue varchar(100),
    modified_at timestamp default current_timestamp,
    foreign key (defectid) references defect(id) on delete cascade
);

CREATE OR REPLACE FUNCTION track_defect_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' THEN
        IF OLD.name IS DISTINCT FROM NEW.name THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'name', OLD.name::VARCHAR, NEW.name::VARCHAR);
        END IF;

        IF OLD.object_id IS DISTINCT FROM NEW.object_id THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'object_id', OLD.object_id::VARCHAR, NEW.object_id::VARCHAR);
        END IF;

        IF OLD.status_id IS DISTINCT FROM NEW.status_id THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'status_id', OLD.status_id::VARCHAR, NEW.status_id::VARCHAR);
        END IF;

        IF OLD.doperson_id IS DISTINCT FROM NEW.doperson_id THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'doperson_id', OLD.doperson_id::VARCHAR, NEW.doperson_id::VARCHAR);
        END IF;

        IF OLD.description IS DISTINCT FROM NEW.description THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'description', 
                   COALESCE(OLD.description::VARCHAR, 'NULL'), 
                   COALESCE(NEW.description::VARCHAR, 'NULL'));
        END IF;

        IF OLD.term IS DISTINCT FROM NEW.term THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'term', OLD.term::VARCHAR, NEW.term::VARCHAR);
        END IF;

        IF OLD.priority IS DISTINCT FROM NEW.priority THEN
            INSERT INTO historyeditdefect (defectid, changecolumn, oldvalue, newvalue)
            VALUES (NEW.id, 'priority', OLD.priority::VARCHAR, NEW.priority::VARCHAR);
        END IF;
    RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;


CREATE TRIGGER defect_update_trigger
    AFTER UPDATE ON defect
    FOR EACH ROW
    EXECUTE FUNCTION  track_defect_changes();